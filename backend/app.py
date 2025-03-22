from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
import os
from datetime import datetime, timedelta
import secrets
import uuid
import random
import string
from werkzeug.security import generate_password_hash, check_password_hash
import requests
import logging
# Remove the TON Client import and replace with a mock implementation
# from tonclient.client import TonClient
# from tonclient.types import ParamsOfQueryCollection, NetworkConfig

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
app.logger.setLevel(logging.INFO)

# Configure SQLite database
basedir = os.path.abspath(os.path.dirname(__file__))
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + os.path.join(basedir, 'mining_app.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
app.config['SECRET_KEY'] = secrets.token_hex(16)

db = SQLAlchemy(app)
# Replace the TON client with a mock
# ton_client = TonClient(network=NetworkConfig(server_address='https://mainnet.tonhubapi.com'))

# Updated Models based on the new schema
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    telegram_id = db.Column(db.String(50), unique=True, nullable=False)
    username = db.Column(db.String(50), nullable=False)
    points_mined = db.Column(db.Integer, default=0)
    last_mine_time = db.Column(db.DateTime, default=datetime.utcnow)
    node_status = db.Column(db.String(10), default='off')
    node_expiry_time = db.Column(db.DateTime, nullable=True)
    wallet_address = db.Column(db.String(100), nullable=True)
    referral_code = db.Column(db.String(10), unique=True, nullable=True)
    referrer_id = db.Column(db.Integer, nullable=True)
    
    # Relationships
    point_cards = db.relationship('PointCard', backref='user', lazy=True)
    upgrades = db.relationship('Upgrade', backref='user', lazy=True)
    sent_escrows = db.relationship('Escrow', foreign_keys='Escrow.sender_id', backref='sender', lazy=True)
    received_escrows = db.relationship('Escrow', foreign_keys='Escrow.receiver_id', backref='receiver', lazy=True)

    def to_dict(self):
        return {
            'id': self.id,
            'telegram_id': self.telegram_id,
            'username': self.username,
            'points_mined': self.points_mined,
            'last_mine_time': self.last_mine_time.isoformat() if self.last_mine_time else None,
            'node_status': self.node_status,
            'node_expiry_time': self.node_expiry_time.isoformat() if self.node_expiry_time else None,
            'wallet_address': self.wallet_address,
            'referral_code': self.referral_code,
            'referrer_id': self.referrer_id
        }

class PointCard(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    card_type = db.Column(db.String(20), nullable=False)  # nano, xeno, zero
    fees_remaining = db.Column(db.Integer, nullable=False)
    purchase_time = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'card_type': self.card_type,
            'fees_remaining': self.fees_remaining,
            'purchase_time': self.purchase_time.isoformat()
        }

class Upgrade(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    upgrade_type = db.Column(db.String(20), nullable=False)  # always_on, auto_claim
    expiry_time = db.Column(db.DateTime, nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'upgrade_type': self.upgrade_type,
            'expiry_time': self.expiry_time.isoformat(),
            'is_active': self.expiry_time > datetime.utcnow()
        }

class Escrow(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    escrow_id = db.Column(db.String(50), unique=True, nullable=False)
    sender_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    sender_wallet_address = db.Column(db.String(100), nullable=False)
    receiver_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)
    receiver_wallet_address = db.Column(db.String(100), nullable=False)
    amount = db.Column(db.Float, nullable=False)
    fee_amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(20), default='pending')  # pending, active, completed, cancelled, pending_cancel
    creation_time = db.Column(db.DateTime, default=datetime.utcnow)
    lock_period = db.Column(db.Integer, nullable=False)
    unlock_time = db.Column(db.DateTime, nullable=False)
    pin_hash = db.Column(db.String(200), nullable=False)
    card_used = db.Column(db.Boolean, default=False)
    cancel_status = db.Column(db.String(20), nullable=True)  # null, sender_requested, receiver_requested
    requested_by = db.Column(db.Integer, nullable=True)  # Store ID of user who requested cancellation

    def to_dict(self):
        return {
            'id': self.id,
            'escrow_id': self.escrow_id,
            'sender_username': User.query.get(self.sender_id).username,
            'receiver_username': User.query.get(self.receiver_id).username,
            'amount': self.amount,
            'fee_amount': self.fee_amount,
            'status': self.status,
            'creation_time': self.creation_time.isoformat(),
            'lock_period': self.lock_period,
            'unlock_time': self.unlock_time.isoformat(),
            'card_used': self.card_used,
            'can_withdraw': datetime.utcnow() >= self.unlock_time and self.status == 'active',
            'cancel_status': self.cancel_status,
            'requested_by': self.requested_by
        }

# Create database tables
with app.app_context():
    db.create_all()

# Mock implementation of TON balance check
def validate_ton_transaction(wallet_address, amount):
    try:
        # Make a real API call to TON Center to get the wallet balance
        api_url = f"https://toncenter.com/api/v2/getAddressBalance?address={wallet_address}"
        response = requests.get(api_url)
        
        if response.status_code == 200:
            data = response.json()
            if data.get("ok"):
                # TON balance is in nanotons (10^-9 TON), convert to TON for comparison
                balance_nanotons = int(data.get("result", "0"))
                balance_tons = balance_nanotons / 1e9
                
                print(f"Wallet {wallet_address} has {balance_tons} TON")
                return balance_tons >= amount
            else:
                print(f"TON API returned an error: {data}")
                return False
        else:
            print(f"TON API request failed with status code: {response.status_code}")
            return False
    except Exception as e:
        print(f"Error validating TON transaction: {e}")
        return False

# Helper Functions
def get_user_by_telegram_id(telegram_id):
    return User.query.filter_by(telegram_id=telegram_id).first()

def get_user_by_username(username):
    return User.query.filter_by(username=username).first()

def get_user_by_referral_code(referral_code):
    return User.query.filter_by(referral_code=referral_code).first()

def generate_referral_code():
    """Generate a unique referral code for the user"""
    chars = string.ascii_uppercase + string.digits
    while True:
        code = ''.join(random.choice(chars) for _ in range(6))
        if not get_user_by_referral_code(code):
            return code

def has_active_upgrade(user_id, upgrade_type):
    upgrade = Upgrade.query.filter_by(
        user_id=user_id, 
        upgrade_type=upgrade_type
    ).filter(Upgrade.expiry_time > datetime.utcnow()).first()
    return upgrade is not None

def verify_telegram_data(init_data):
    """
    Validates Telegram WebApp initData and extracts user information.
    
    In a production environment, you must verify the authenticity of init_data
    by checking the hash as described in the Telegram documentation:
    https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
    
    For this implementation, we'll extract the user data but add proper validation comments.
    """
    try:
        # Extract user data
        user_data = init_data.get('user', {})
        
        if not user_data or not user_data.get('id'):
            return None
            
        # In production, you would:
        # 1. Parse the query string parameters from init_data
        # 2. Extract the hash value
        # 3. Sort the remaining parameters alphabetically
        # 4. Create a data-check-string
        # 5. Calculate HMAC-SHA-256 signature using your bot token
        # 6. Compare with the hash from init_data
        
        return {
            'id': user_data.get('id'),
            'username': user_data.get('username', f"user{user_data.get('id')}")
        }
    except Exception as e:
        print(f"Error validating Telegram data: {e}")
        return None

# API Routes
# Authentication Endpoints
@app.route('/api/auth/check_and_create_user', methods=['POST'])
def check_and_create_user():
    data = request.json
    app.logger.info(f"Received request to check/create user: {data}")
    
    # Log the entire request data
    app.logger.info(f"Full request data: {request.data}")
    
    # Log headers to check for any Telegram-specific information
    app.logger.info(f"Request headers: {request.headers}")
    
    if not data:
        app.logger.error("No data provided in request")
        return jsonify({'error': 'No data provided'}), 400
    
    # Handle both direct user_id and Telegram initData formats
    telegram_id = None
    username = None
    referral_code = None
    
    if 'initData' in data:
        # This is coming from Telegram Mini App
        telegram_data = verify_telegram_data(data.get('initData'))
        if not telegram_data or 'id' not in telegram_data:
            app.logger.error("Invalid Telegram data")
            return jsonify({'error': 'Invalid Telegram data'}), 400
        
        telegram_id = telegram_data['id']
        username = telegram_data.get('username', f"user{telegram_id}")
        
        # Extract start parameter from initData if available
        start_param = data.get('start_param')
        app.logger.info(f"Start parameter from Telegram: {start_param}")
        if start_param:
            referral_code = start_param
    else:
        # Direct user data format
        telegram_id = data.get('user_id') or data.get('telegram_id')
        username = data.get('username')
        referral_code = data.get('referral_code')
        
        if not telegram_id or not username:
            app.logger.error("Missing required user data")
            return jsonify({'error': 'Missing required user data'}), 400
    
    app.logger.info(f"Looking up user with telegram_id: {telegram_id}")
    user = get_user_by_telegram_id(telegram_id)
    
    if not user:
        app.logger.info(f"User {telegram_id} not found, creating new user")
        # Check for referrer if referral code provided
        referrer = None
        if referral_code:
            referrer = get_user_by_referral_code(referral_code)
            app.logger.info(f"Found referrer: {referrer.username if referrer else 'None'}")
        
        # Create a new user with referral code
        user = User(
            telegram_id=telegram_id,
            username=username,
            referral_code=generate_referral_code(),
            referrer_id=referrer.id if referrer else None
        )
        
        db.session.add(user)
        
        try:
            db.session.commit()
            app.logger.info(f"Created new user: {user.username} with referral code: {user.referral_code}")
            
            # If there was a referrer, could award bonus points here
            if referrer:
                # Award 50 bonus points to referrer
                referrer.points_mined += 50
                db.session.commit()
                app.logger.info(f"Awarded 50 bonus points to referrer {referrer.username}")
        except Exception as e:
            app.logger.error(f"Error creating user: {str(e)}")
            db.session.rollback()
            return jsonify({'error': 'Failed to create user'}), 500
    else:
        app.logger.info(f"Found existing user: {user.username}")
    
    response_data = user.to_dict()
    app.logger.info(f"Sending response: {response_data}")
    
    return jsonify(response_data), 200

# Keep the original login endpoint for backward compatibility
@app.route('/api/auth/login', methods=['POST'])
def login():
    return check_and_create_user()

@app.route('/api/auth/get_user', methods=['GET'])
def get_user():
    telegram_id = request.args.get('telegram_id')
    if not telegram_id:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(telegram_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    return jsonify(user.to_dict()), 200

@app.route('/api/auth/get_referrals', methods=['GET'])
def get_referrals():
    telegram_id = request.args.get('telegram_id')
    if not telegram_id:
        app.logger.error("Missing telegram_id in request")
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(telegram_id)
    if not user:
        app.logger.error(f"User with telegram_id {telegram_id} not found")
        return jsonify({'error': 'User not found'}), 404
    
    if not user.referral_code:
        app.logger.info(f"User {user.username} has no referral code, generating one")
        user.referral_code = generate_referral_code()
        db.session.commit()
    
    # Find all users who have this user as their referrer
    referred_users = User.query.filter_by(referrer_id=user.id).all()
    app.logger.info(f"Found {len(referred_users)} users referred by {user.username}")
    
    return jsonify({
        'referral_code': user.referral_code,
        'referral_link': f"https://t.me/ton_mine_escrow_bot/app?startapp={user.referral_code}",
        'referral_count': len(referred_users),
        'referred_users': [
            {
                'username': referred.username,
                'points_mined': referred.points_mined,
                'joined_date': referred.last_mine_time.isoformat()
            } for referred in referred_users
        ],
        'bonus_points': len(referred_users) * 50  # 50 points per referral
    }), 200

# Game Endpoints
@app.route('/api/game/start_node', methods=['POST'])
def start_node():
    data = request.json
    if not data or 'telegram_id' not in data:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(data['telegram_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    # Check if node is already running
    if user.node_status == 'on' and user.node_expiry_time and user.node_expiry_time > datetime.utcnow():
        return jsonify({
            'error': 'Node already running',
            'remaining_time': (user.node_expiry_time - datetime.utcnow()).total_seconds()
        }), 400
        
    # Start the node
    user.node_status = 'on'
    user.last_mine_time = datetime.utcnow()
    user.node_expiry_time = datetime.utcnow() + timedelta(hours=3)
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'node_status': 'on',
        'expiry_time': user.node_expiry_time.isoformat(),
        'remaining_time': (user.node_expiry_time - datetime.utcnow()).total_seconds()
    }), 200

@app.route('/api/game/check_status', methods=['GET'])
def check_status():
    telegram_id = request.args.get('telegram_id')
    if not telegram_id:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(telegram_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    now = datetime.utcnow()
    
    # Check if node is running and not expired
    if user.node_status == 'on' and user.node_expiry_time:
        if now >= user.node_expiry_time:
            # Node has completed mining
            can_claim = True
            remaining_time = 0
            # Auto-claim if user has the upgrade
            if has_active_upgrade(user.id, 'auto_claim'):
                # Award points
                user.points_mined += 100
                user.node_status = 'off'
                user.node_expiry_time = None
                db.session.commit()
                return jsonify({
                    'status': 'completed',
                    'auto_claimed': True,
                    'points_awarded': 100,
                    'total_points': user.points_mined
                }), 200
        else:
            # Node is still mining
            can_claim = False
            remaining_time = (user.node_expiry_time - now).total_seconds()
    else:
        # Node is off
        can_claim = False
        remaining_time = 0
    
    # Check Always-On upgrade for continuation
    if user.node_status == 'off' and has_active_upgrade(user.id, 'always_on'):
        # Auto-restart node if it's off and user has always-on upgrade
        user.node_status = 'on'
        user.node_expiry_time = now + timedelta(hours=3)
        db.session.commit()
        return jsonify({
            'status': 'restarted',
            'node_status': 'on',
            'expiry_time': user.node_expiry_time.isoformat(),
            'remaining_time': (user.node_expiry_time - now).total_seconds()
        }), 200
    
    return jsonify({
        'node_status': user.node_status,
        'remaining_time': remaining_time,
        'can_claim': can_claim,
        'total_points': user.points_mined
    }), 200

@app.route('/api/game/claim', methods=['POST'])
def claim_points():
    data = request.json
    if not data or 'telegram_id' not in data:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(data['telegram_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    # Check if mining is complete and can be claimed
    now = datetime.utcnow()
    if user.node_status != 'on' or not user.node_expiry_time or now < user.node_expiry_time:
        return jsonify({'error': 'No points available to claim'}), 400
        
    # Award points (100 per session)
    user.points_mined += 100
    user.node_status = 'off'
    user.node_expiry_time = None
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'points_awarded': 100,
        'total_points': user.points_mined
    }), 200

@app.route('/api/game/stats', methods=['GET'])
def get_stats():
    telegram_id = request.args.get('telegram_id')
    if not telegram_id:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(telegram_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    # In a real app, you might fetch mining history from a separate table
    # For this demo, we'll just return the total points
    return jsonify({
        'total_points': user.points_mined,
        'last_mine_time': user.last_mine_time.isoformat() if user.last_mine_time else None
    }), 200

# Shop Endpoints
@app.route('/api/shop/buy_upgrade', methods=['POST'])
def buy_upgrade():
    data = request.json
    if not data or 'telegram_id' not in data or 'upgrade_type' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
        
    user = get_user_by_telegram_id(data['telegram_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    upgrade_type = data['upgrade_type']
    
    # Check if upgrade type is valid
    if upgrade_type not in ['always_on', 'auto_claim']:
        return jsonify({'error': 'Invalid upgrade type'}), 400
        
    # Check if user has wallet connected
    if not user.wallet_address:
        return jsonify({'error': 'Wallet not connected'}), 400
        
    # Set price based on upgrade type
    price = 5.0 if upgrade_type == 'always_on' else 1.0
    
    # Validate TON transaction
    if not validate_ton_transaction(user.wallet_address, price):
        return jsonify({'error': 'Insufficient TON balance'}), 400
        
    # Create new upgrade with 7-day expiry
    upgrade = Upgrade(
        user_id=user.id,
        upgrade_type=upgrade_type,
        expiry_time=datetime.utcnow() + timedelta(days=7)
    )
    db.session.add(upgrade)
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'upgrade': upgrade.to_dict()
    }), 201

@app.route('/api/shop/buy_card', methods=['POST'])
def buy_card():
    data = request.json
    if not data or 'telegram_id' not in data or 'card_type' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
        
    user = get_user_by_telegram_id(data['telegram_id'])
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    card_type = data['card_type']
    
    # Check if card type is valid
    if card_type not in ['nano', 'xeno', 'zero']:
        return jsonify({'error': 'Invalid card type'}), 400
        
    # Check if user has wallet connected
    if not user.wallet_address:
        return jsonify({'error': 'Wallet not connected'}), 400
        
    # Set price and fees_remaining based on card type
    price_map = {
        'nano': 3.0,
        'xeno': 5.0, 
        'zero': 10.0
    }
    fees_map = {
        'nano': 3,
        'xeno': 5,
        'zero': 10
    }
    
    price = price_map[card_type]
    fees_remaining = fees_map[card_type]
    
    # Validate TON transaction
    if not validate_ton_transaction(user.wallet_address, price):
        return jsonify({'error': 'Insufficient TON balance'}), 400
        
    # Create new point card
    card = PointCard(
        user_id=user.id,
        card_type=card_type,
        fees_remaining=fees_remaining
    )
    db.session.add(card)
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'card': card.to_dict()
    }), 201

@app.route('/api/shop/inventory', methods=['GET'])
def get_inventory():
    telegram_id = request.args.get('telegram_id')
    if not telegram_id:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(telegram_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    # Get active upgrades
    now = datetime.utcnow()
    active_upgrades = Upgrade.query.filter_by(user_id=user.id).filter(Upgrade.expiry_time > now).all()
    
    # Get point cards with remaining uses
    point_cards = PointCard.query.filter_by(user_id=user.id).filter(PointCard.fees_remaining > 0).all()
    
    return jsonify({
        'upgrades': [upgrade.to_dict() for upgrade in active_upgrades],
        'point_cards': [card.to_dict() for card in point_cards]
    }), 200

# Escrow Endpoints
@app.route('/api/escrow/create', methods=['POST'])
def create_escrow():
    data = request.json
    required_fields = ['sender_telegram_id', 'receiver_username', 'amount', 'lock_period', 'pin']
    if not data or not all(field in data for field in required_fields):
        return jsonify({'error': 'Missing required fields'}), 400
        
    sender = get_user_by_telegram_id(data['sender_telegram_id'])
    receiver = get_user_by_username(data['receiver_username'])
    
    if not sender:
        return jsonify({'error': 'Sender not found'}), 404
        
    if not receiver:
        return jsonify({'error': 'Receiver not found'}), 404
        
    # Validate sender has wallet connected
    if not sender.wallet_address:
        return jsonify({'error': 'Sender wallet not connected'}), 400
        
    # Validate receiver has wallet connected
    if not receiver.wallet_address:
        return jsonify({'error': 'Receiver wallet not connected'}), 400
        
    amount = float(data['amount'])
    lock_period = int(data['lock_period'])
    
    # Calculate fee (5% from both sender and receiver)
    fee_amount = amount * 0.1
    total_amount = amount + (fee_amount / 2)  # Sender pays half the fee initially
    
    # Check if using point card
    use_card = data.get('use_point_card', False)
    card_id = data.get('card_id')
    card = None
    
    if use_card and card_id:
        card = PointCard.query.filter_by(id=card_id, user_id=sender.id).first()
        if not card or card.fees_remaining <= 0:
            return jsonify({'error': 'Invalid point card or insufficient fees remaining'}), 400
    
    # If not using card, validate TON transaction
    if not use_card and not validate_ton_transaction(sender.wallet_address, total_amount):
        return jsonify({'error': 'Insufficient TON balance'}), 400
        
    # Create escrow with unique ID
    escrow_id = str(uuid.uuid4())
    unlock_time = datetime.utcnow() + timedelta(days=lock_period)
    
    escrow = Escrow(
        escrow_id=escrow_id,
        sender_id=sender.id,
        sender_wallet_address=sender.wallet_address,
        receiver_id=receiver.id,
        receiver_wallet_address=receiver.wallet_address,
        amount=amount,
        fee_amount=fee_amount,
        status='active',
        lock_period=lock_period,
        unlock_time=unlock_time,
        pin_hash=generate_password_hash(data['pin']),
        card_used=use_card
    )
    
    db.session.add(escrow)
    
    # If using card, decrement the card's remaining fees
    if use_card and card:
        card.fees_remaining -= 1
    
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'escrow': escrow.to_dict()
    }), 201

@app.route('/api/escrow/info/<string:escrow_id>', methods=['GET'])
def get_escrow_info(escrow_id):
    escrow = Escrow.query.filter_by(escrow_id=escrow_id).first()
    if not escrow:
        return jsonify({'error': 'Escrow not found'}), 404
        
    return jsonify(escrow.to_dict()), 200

@app.route('/api/escrow/release/<string:escrow_id>', methods=['POST'])
def release_escrow(escrow_id):
    data = request.json
    if not data or 'telegram_id' not in data:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(data['telegram_id'])
    escrow = Escrow.query.filter_by(escrow_id=escrow_id).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if not escrow:
        return jsonify({'error': 'Escrow not found'}), 404
        
    # Verify user is the sender
    if escrow.sender_id != user.id:
        return jsonify({'error': 'Only the sender can release funds early'}), 403
        
    # Verify escrow is active
    if escrow.status != 'active':
        return jsonify({'error': 'Escrow is not active'}), 400
        
    # Release funds to receiver
    escrow.status = 'completed'
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': 'Funds released successfully'
    }), 200

@app.route('/api/escrow/withdraw/<string:escrow_id>', methods=['POST'])
def withdraw_escrow(escrow_id):
    data = request.json
    if not data or 'telegram_id' not in data or 'pin' not in data:
        return jsonify({'error': 'Missing required fields'}), 400
        
    user = get_user_by_telegram_id(data['telegram_id'])
    escrow = Escrow.query.filter_by(escrow_id=escrow_id).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if not escrow:
        return jsonify({'error': 'Escrow not found'}), 404
        
    # Verify user is the receiver
    if escrow.receiver_id != user.id:
        return jsonify({'error': 'Only the receiver can withdraw funds'}), 403
        
    # Verify escrow is active
    if escrow.status != 'active':
        return jsonify({'error': 'Escrow is not active'}), 400
        
    # Verify unlock time has passed
    if datetime.utcnow() < escrow.unlock_time:
        return jsonify({'error': 'Escrow is still locked'}), 400
        
    # Verify PIN
    if not check_password_hash(escrow.pin_hash, data['pin']):
        return jsonify({'error': 'Invalid PIN'}), 401
        
    # Process withdrawal
    # In a real app, this would transfer TON to the receiver
    escrow.status = 'completed'
    db.session.commit()
    
    return jsonify({
        'status': 'success',
        'message': 'Funds withdrawn successfully'
    }), 200

@app.route('/api/escrow/cancel/<string:escrow_id>', methods=['POST'])
def cancel_escrow(escrow_id):
    data = request.json
    if not data or 'telegram_id' not in data:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(data['telegram_id'])
    escrow = Escrow.query.filter_by(escrow_id=escrow_id).first()
    
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    if not escrow:
        return jsonify({'error': 'Escrow not found'}), 404
        
    # Verify user is either sender or receiver
    if escrow.sender_id != user.id and escrow.receiver_id != user.id:
        return jsonify({'error': 'Only the sender or receiver can request cancellation'}), 403
        
    # Verify escrow is active
    if escrow.status != 'active' and escrow.status != 'pending_cancel':
        return jsonify({'error': 'Escrow is not active or pending cancellation'}), 400
    
    # Implement proper cancellation workflow
    # Check if user is sender or receiver
    is_sender = (escrow.sender_id == user.id)
    
    # Process cancellation request
    if escrow.status == 'pending_cancel':
        # Check if the other party is confirming the cancellation
        if (is_sender and escrow.cancel_status == 'receiver_requested') or \
           (not is_sender and escrow.cancel_status == 'sender_requested'):
            # Both parties have confirmed cancellation
            escrow.status = 'cancelled'
            escrow.cancel_status = 'mutual'
            db.session.commit()
            
            return jsonify({
                'status': 'success',
                'message': 'Escrow cancelled successfully'
            }), 200
        else:
            # This is the same person trying to cancel again
            return jsonify({
                'status': 'pending',
                'message': 'Cancellation already requested. Waiting for the other party.'
            }), 200
    else:
        # First cancellation request
        escrow.status = 'pending_cancel'
        escrow.requested_by = user.id
        
        if is_sender:
            escrow.cancel_status = 'sender_requested'
        else:
            escrow.cancel_status = 'receiver_requested'
            
        db.session.commit()
        
        return jsonify({
            'status': 'pending',
            'message': 'Cancellation request submitted. Waiting for confirmation from the other party.'
        }), 200

@app.route('/api/escrow/list', methods=['GET'])
def list_escrows():
    telegram_id = request.args.get('telegram_id')
    if not telegram_id:
        return jsonify({'error': 'Missing telegram_id'}), 400
        
    user = get_user_by_telegram_id(telegram_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404
        
    # Get escrows where user is either sender or receiver
    sent_escrows = Escrow.query.filter_by(sender_id=user.id).all()
    received_escrows = Escrow.query.filter_by(receiver_id=user.id).all()
    
    # Separate active and past escrows
    active_escrows = []
    past_escrows = []
    
    for escrow in sent_escrows + received_escrows:
        if escrow.status == 'active':
            active_escrows.append(escrow.to_dict())
        else:
            past_escrows.append(escrow.to_dict())
    
    return jsonify({
        'active_escrows': active_escrows,
        'past_escrows': past_escrows
    }), 200

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000) 