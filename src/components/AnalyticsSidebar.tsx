import React from 'react';
import {
  Drawer,
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
  LinearProgress,
  Divider,
} from '@mui/material';
import {
  TrendingUp,
  Speed,
  AttachMoney,
  Cached,
} from '@mui/icons-material';
import { BarChart } from '@mui/x-charts/BarChart';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { costTracker } from '../lib/costTracker';

interface AnalyticsSidebarProps {
  open: boolean;
  onClose: () => void;
}

export const AnalyticsSidebar: React.FC<AnalyticsSidebarProps> = ({ open, onClose }) => {
  const analytics = useSelector((state: RootState) => state.analytics);
  const { chats } = useSelector((state: RootState) => state.chat);

  const totalMessages = chats.reduce((sum, chat) => sum + chat.messages.length, 0);
  const totalCost = costTracker.getTotalCost();
  const todayCost = costTracker.getTodayCost();

  // Mock data for demonstration
  const dailyUsage = [
    { day: 'Mon', requests: 12, cost: 0.45 },
    { day: 'Tue', requests: 8, cost: 0.32 },
    { day: 'Wed', requests: 15, cost: 0.67 },
    { day: 'Thu', requests: 22, cost: 0.89 },
    { day: 'Fri', requests: 18, cost: 0.72 },
    { day: 'Sat', requests: 6, cost: 0.23 },
    { day: 'Sun', requests: 10, cost: 0.41 },
  ];

  const StatCard: React.FC<{
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color?: string;
  }> = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Box
          sx={{
            p: 1,
            borderRadius: 1,
            bgcolor: `${color}.main`,
            color: 'white',
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {icon}
        </Box>
        <Box>
          <Typography variant="h6">{value}</Typography>
          <Typography variant="body2" color="text.secondary">
            {title}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      sx={{
        '& .MuiDrawer-paper': {
          width: 400,
          maxWidth: '90vw',
        },
      }}
    >
      <Box sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Analytics
        </Typography>

        <Divider sx={{ mb: 3 }} />

        {/* Key Metrics */}
        <Typography variant="h6" gutterBottom>
          Overview
        </Typography>

        <StatCard
          title="Total Requests"
          value={analytics.totalRequests}
          icon={<TrendingUp />}
          color="primary"
        />

        <StatCard
          title="Total Messages"
          value={totalMessages}
          icon={<TrendingUp />}
          color="secondary"
        />

        <StatCard
          title="Average Latency"
          value={`${analytics.averageLatency}ms`}
          icon={<Speed />}
          color="info"
        />

        <StatCard
          title="Cache Hit Rate"
          value={`${(analytics.cacheHitRate * 100).toFixed(1)}%`}
          icon={<Cached />}
          color="success"
        />

        <Divider sx={{ my: 3 }} />

        {/* Cost Tracking */}
        <Typography variant="h6" gutterBottom>
          Cost Tracking
        </Typography>

        <StatCard
          title="Total Cost"
          value={`$${totalCost.toFixed(4)}`}
          icon={<AttachMoney />}
          color="warning"
        />

        <StatCard
          title="Today's Cost"
          value={`$${todayCost.toFixed(4)}`}
          icon={<AttachMoney />}
          color="error"
        />

        {/* Budget Progress */}
        <Card sx={{ mb: 2 }}>
          <CardContent>
            <Typography variant="subtitle2" gutterBottom>
              Daily Budget
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LinearProgress
                variant="determinate"
                value={Math.min((todayCost / 5) * 100, 100)} // $5 daily budget
                sx={{ flex: 1, height: 8, borderRadius: 4 }}
              />
              <Typography variant="body2">
                ${todayCost.toFixed(2)} / $5.00
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* Usage Chart */}
        <Typography variant="h6" gutterBottom>
          Weekly Usage
        </Typography>

        <Card>
          <CardContent>
            <BarChart
              width={350}
              height={200}
              series={[
                {
                  data: dailyUsage.map(d => d.requests),
                  label: 'Requests',
                  color: '#1976d2',
                },
              ]}
              xAxis={[{
                data: dailyUsage.map(d => d.day),
                scaleType: 'band',
              }]}
            />
          </CardContent>
        </Card>

        <Divider sx={{ my: 3 }} />

        {/* Performance Indicators */}
        <Typography variant="h6" gutterBottom>
          Performance
        </Typography>

        <Box sx={{ display: 'flex', justifyContent: 'space-around',  mb: 2 }}>
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              variant="determinate"
              value={85}
              size={60}
              thickness={4}
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Uptime
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              variant="determinate"
              value={analytics.cacheHitRate * 100}
              size={60}
              thickness={4}
              color="success"
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Cache Hit
            </Typography>
          </Box>
          
          <Box sx={{ textAlign: 'center' }}>
            <CircularProgress
              variant="determinate"
              value={Math.max(100 - (analytics.averageLatency / 10), 0)}
              size={60}
              thickness={4}
              color="info"
            />
            <Typography variant="caption" display="block" sx={{ mt: 1 }}>
              Speed
            </Typography>
          </Box>
        </Box>
      </Box>
    </Drawer>
  );
};