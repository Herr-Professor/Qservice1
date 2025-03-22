import React from 'react';
import { Container } from 'react-bootstrap';
import Profile from '../components/Profile';
import PageHeader from '../components/PageHeader';

const ProfilePage = () => {
  return (
    <>
      <PageHeader title="Profile" />
      <Container className="mt-3 mb-5">
        <Profile />
      </Container>
    </>
  );
};

export default ProfilePage; 