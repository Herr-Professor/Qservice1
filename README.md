# TON Mine & Escrow - Telegram Mini App

A Telegram Mini App integrating with the TON blockchain, featuring both a mining game and an escrow service.

## Features

### Mining Game
- Mine points when your node is on (3-hour mining sessions)
- Claim your mined points
- Purchase auto-claim and always-on features
- Buy upgrades to hasten your mining process

### Escrow Service
- Secure escrow service for TON transactions
- 5% fee from both sender and receiver
- If no withdrawal after 14 days of lock period, the receiver can withdraw
- Use points instead of paying percentage fees
- Purchase point cards to offset percentage cuts

## Prerequisites

- Node.js (v18+)
- npm or yarn
- Telegram Bot created via BotFather
- TON wallet for testing

## Setup

1. Clone the repository
```
git clone https://github.com/yourusername/ton-mine-escrow.git
cd ton-mine-escrow
```

2. Install dependencies
```
npm install
```

3. Create `.env` file and add your configuration
```
# Copy the example .env file
cp .env.example .env

# Edit the .env file with your Telegram Bot token and other settings
```

4. Start the development server
```
npm start
```

## Deployment

1. Build the production version
```
npm run build
```

2. Deploy the built files from the `dist` directory to your web server

3. Configure your Telegram Bot to work with your deployed mini app

## License

[MIT](LICENSE)
