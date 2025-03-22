import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import { Container, Card, Button, ProgressBar } from 'react-bootstrap';

const Mining = () => {
  const { miningState, startMining, handleClaimPoints, refreshMiningStatus, user } = useContext(AppContext);
  const [timeLeft, setTimeLeft] = useState(0);
  const [progress, setProgress] = useState(0);

  // Update timer and progress bar
  useEffect(() => {
    let timer;
    if (miningState.status === 'on' && miningState.timeLeft > 0) {
      setTimeLeft(miningState.timeLeft);
      const maxTime = 3 * 60 * 60; // 3 hours in seconds
      const progressValue = 100 - (miningState.timeLeft / maxTime * 100);
      setProgress(progressValue);
      
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            refreshMiningStatus(user.telegram_id);
            return 0;
          }
          
          const newTimeLeft = prev - 1;
          const newProgress = 100 - (newTimeLeft / maxTime * 100);
          setProgress(newProgress);
          return newTimeLeft;
        });
      }, 1000);
    } else if (miningState.canClaim) {
      setProgress(100);
      setTimeLeft(0);
    } else {
      setProgress(0);
      setTimeLeft(0);
    }
    
    return () => clearInterval(timer);
  }, [miningState, refreshMiningStatus, user]);

  // Format time display (HH:MM:SS)
  const formatTime = (seconds) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Container className="mt-3">
      <Card>
        <Card.Header>
          <h5>Mining Node</h5>
        </Card.Header>
        <Card.Body>
          <div className="text-center mb-4">
            <h3>Points Mined: {user?.points_mined || 0}</h3>
          </div>
          
          <ProgressBar 
            now={progress} 
            label={`${Math.round(progress)}%`} 
            variant={miningState.canClaim ? "success" : "primary"}
            className="mb-3"
          />
          
          <div className="d-flex justify-content-between align-items-center mb-4">
            <span>Status: <strong>{miningState.status === 'on' ? 'Mining' : 'Idle'}</strong></span>
            <span>Time Left: <strong>{formatTime(timeLeft)}</strong></span>
          </div>
          
          {miningState.canClaim ? (
            <Button 
              variant="success" 
              size="lg" 
              block 
              onClick={handleClaimPoints}
              className="w-100"
            >
              Claim 100 Points
            </Button>
          ) : miningState.status === 'on' ? (
            <Button 
              variant="secondary" 
              size="lg" 
              block 
              disabled
              className="w-100"
            >
              Mining in Progress...
            </Button>
          ) : (
            <Button 
              variant="primary" 
              size="lg" 
              block 
              onClick={startMining}
              className="w-100"
            >
              Start Mining (3 hours)
            </Button>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default Mining; 