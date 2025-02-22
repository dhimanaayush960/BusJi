import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
  Button,
  Switch,
  FormControlLabel
} from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

function Dashboard() {
  const { currentUser } = useAuth();
  const [favoriteRoutes, setFavoriteRoutes] = useState([]);
  const [notifications, setNotifications] = useState(true);
  const [recentBuses, setRecentBuses] = useState([]);

  useEffect(() => {
    if (currentUser) {
      // Load user preferences
      const userPrefsRef = ref(database, `users/${currentUser.uid}/preferences`);
      onValue(userPrefsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          setFavoriteRoutes(data.favoriteRoutes || []);
          setNotifications(data.notifications !== false);
        }
      });

      // Load recent buses
      const busesRef = ref(database, 'buses');
      onValue(busesRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const busArray = Object.entries(data)
            .map(([id, bus]) => ({
              id,
              ...bus,
              lastUpdate: bus.location?.lastUpdate || 0
            }))
            .sort((a, b) => b.lastUpdate - a.lastUpdate)
            .slice(0, 5);
          setRecentBuses(busArray);
        }
      });
    }
  }, [currentUser]);

  const handleNotificationToggle = async () => {
    try {
      const newNotificationState = !notifications;
      await set(ref(database, `users/${currentUser.uid}/preferences/notifications`), newNotificationState);
      setNotifications(newNotificationState);
      toast.success(`Notifications ${newNotificationState ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update notification preferences');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        {/* Welcome Section */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h4" gutterBottom>
              Welcome, {currentUser?.email}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Manage your bus tracking preferences and view recent updates.
            </Typography>
          </Paper>
        </Grid>

        {/* Recent Buses */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Recent Bus Updates
            </Typography>
            <List>
              {recentBuses.map((bus) => (
                <React.Fragment key={bus.id}>
                  <ListItem>
                    <ListItemIcon>
                      <DirectionsBusIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={`Bus ${bus.id} - Route ${bus.route}`}
                      secondary={`Last updated: ${new Date(bus.lastUpdate).toLocaleString()}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Preferences */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Preferences
            </Typography>
            
            <FormControlLabel
              control={
                <Switch
                  checked={notifications}
                  onChange={handleNotificationToggle}
                  color="primary"
                />
              }
              label="Push Notifications"
            />

            <Box sx={{ mt: 3 }}>
              <Typography variant="subtitle1" gutterBottom>
                Favorite Routes
              </Typography>
              <List dense>
                {favoriteRoutes.map((route, index) => (
                  <ListItem key={index}>
                    <ListItemIcon>
                      <NotificationsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={`Route ${route}`} />
                  </ListItem>
                ))}
              </List>
              <Button
                variant="outlined"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
                onClick={() => toast.info('Feature coming soon!')}
              >
                Manage Favorite Routes
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
}

export default Dashboard;
