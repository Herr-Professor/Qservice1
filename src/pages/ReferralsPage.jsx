import React from 'react';
import { Container } from 'react-bootstrap';
import Referrals from '../components/Referrals';
import PageHeader from '../components/PageHeader';

const ReferralsPage = () => {
  return (
    <>
      <PageHeader title="Referrals" />
      <Container className="mt-3 mb-5">
        <Referrals />
      </Container>
    </>
  );
};

export default ReferralsPage; 