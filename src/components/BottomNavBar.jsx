import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Container, Row, Col } from 'react-bootstrap';
import { 
  FaHome, 
  FaUser, 
  FaExchangeAlt, 
  FaStore,
  FaGift 
} from 'react-icons/fa';
import './BottomNavBar.css';

const BottomNavBar = () => {
  const location = useLocation();
  const isActive = path => location.pathname === path;

  return (
    <div className="bottom-nav-container">
      <Container fluid>
        <Row className="bottom-nav">
          <Col className={`nav-item ${isActive('/') ? 'active' : ''}`}>
            <Link to="/" className="nav-link">
              <FaHome />
              <span>Home</span>
            </Link>
          </Col>
          <Col className={`nav-item ${isActive('/shop') ? 'active' : ''}`}>
            <Link to="/shop" className="nav-link">
              <FaStore />
              <span>Shop</span>
            </Link>
          </Col>
          <Col className={`nav-item ${isActive('/escrow') ? 'active' : ''}`}>
            <Link to="/escrow" className="nav-link">
              <FaExchangeAlt />
              <span>Escrow</span>
            </Link>
          </Col>
          <Col className={`nav-item ${isActive('/referrals') ? 'active' : ''}`}>
            <Link to="/referrals" className="nav-link">
              <FaGift />
              <span>Referrals</span>
            </Link>
          </Col>
          <Col className={`nav-item ${isActive('/profile') ? 'active' : ''}`}>
            <Link to="/profile" className="nav-link">
              <FaUser />
              <span>Profile</span>
            </Link>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default BottomNavBar;
