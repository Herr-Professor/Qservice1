import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import { Card, Typography, Button, List, Avatar, Space, Divider, Tooltip, message } from 'antd';
import { UserOutlined, CopyOutlined, SendOutlined, GiftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const Referrals = () => {
  const { referralData, refreshReferrals, user } = useContext(AppContext);

  // Handle copy referral link to clipboard
  const copyReferralLink = () => {
    if (referralData?.referral_link) {
      navigator.clipboard.writeText(referralData.referral_link)
        .then(() => {
          message.success('Referral link copied to clipboard!');
        })
        .catch(() => {
          message.error('Failed to copy referral link');
        });
    }
  };

  // Handle share referral link via Telegram
  const shareReferralLink = () => {
    if (referralData?.referral_link && window.Telegram?.WebApp) {
      const shareText = `Join the mining game with my referral link: ${referralData.referral_link}`;
      window.Telegram.WebApp.switchInlineQuery(shareText, ['users', 'groups', 'channels']);
    }
  };

  // Refresh referral data
  const handleRefresh = () => {
    if (user?.telegram_id) {
      refreshReferrals(user.telegram_id);
    }
  };

  // If no referral data yet, show loading state
  if (!referralData) {
    return (
      <Card title="Your Referrals" loading />
    );
  }

  return (
    <Card 
      title={
        <Space>
          <GiftOutlined /> 
          <span>Your Referrals</span>
        </Space>
      }
      extra={
        <Button type="text" onClick={handleRefresh}>
          Refresh
        </Button>
      }
    >
      <Space direction="vertical" style={{ width: '100%' }}>
        <div>
          <Title level={4}>Your Referral Code</Title>
          <Space>
            <Text copyable strong style={{ fontSize: '18px' }}>
              {referralData.referral_code}
            </Text>
            <Tooltip title="Copy referral link">
              <Button 
                icon={<CopyOutlined />} 
                onClick={copyReferralLink}
                size="small"
              />
            </Tooltip>
            <Tooltip title="Share via Telegram">
              <Button 
                icon={<SendOutlined />} 
                onClick={shareReferralLink}
                size="small"
                type="primary"
              />
            </Tooltip>
          </Space>
        </div>

        <Divider />

        <div>
          <Space align="center" style={{ marginBottom: '16px' }}>
            <Title level={4} style={{ margin: 0 }}>Referral Bonus</Title>
            <Text type="success" strong style={{ fontSize: '18px' }}>
              +{referralData.bonus_points} Points
            </Text>
          </Space>
          
          <Text>
            You've referred {referralData.referred_users_count} {referralData.referred_users_count === 1 ? 'user' : 'users'}.
            Earn 50 points for each new user who joins with your referral code!
          </Text>
        </div>

        <Divider />

        <div>
          <Title level={4}>Referred Users</Title>
          {referralData.referred_users && referralData.referred_users.length > 0 ? (
            <List
              itemLayout="horizontal"
              dataSource={referralData.referred_users}
              renderItem={user => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} />}
                    title={user.username || `User ${user.telegram_id.substring(0, 8)}...`}
                    description={`Joined: ${new Date(user.created_at).toLocaleDateString()}`}
                  />
                </List.Item>
              )}
            />
          ) : (
            <Text type="secondary">You haven't referred any users yet. Share your referral code to start earning bonuses!</Text>
          )}
        </div>
      </Space>
    </Card>
  );
};

export default Referrals; 