import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Tab,
  Tabs
} from '@mui/material';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';

function Schedule() {
  const [routes, setRoutes] = useState([]);
  const [selectedRoute, setSelectedRoute] = useState('');
  const [scheduleType, setScheduleType] = useState('weekday');
  const [schedule, setSchedule] = useState(null);

  useEffect(() => {
    const schedulesRef = ref(database, 'schedules');
    const unsubscribe = onValue(schedulesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const routesList = Object.keys(data).map(routeId => ({
          id: routeId,
          ...data[routeId]
        }));
        setRoutes(routesList);
        if (!selectedRoute && routesList.length > 0) {
          setSelectedRoute(routesList[0].id);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedRoute) {
      const scheduleRef = ref(database, `schedules/${selectedRoute}`);
      const unsubscribe = onValue(scheduleRef, (snapshot) => {
        const data = snapshot.val();
        setSchedule(data);
      });

      return () => unsubscribe();
    }
  }, [selectedRoute]);

  const handleRouteChange = (event) => {
    setSelectedRoute(event.target.value);
  };

  const handleScheduleTypeChange = (event, newValue) => {
    setScheduleType(newValue);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Bus Schedule
        </Typography>

        <FormControl fullWidth sx={{ mb: 2 }}>
          <InputLabel>Select Route</InputLabel>
          <Select
            value={selectedRoute}
            label="Select Route"
            onChange={handleRouteChange}
          >
            {routes.map((route) => (
              <MenuItem key={route.id} value={route.id}>
                Route {route.id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tabs
          value={scheduleType}
          onChange={handleScheduleTypeChange}
          sx={{ mb: 2 }}
        >
          <Tab value="weekday" label="Weekday" />
          <Tab value="weekend" label="Weekend" />
        </Tabs>

        {schedule && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Stop Name</TableCell>
                  <TableCell>Arrival Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule[`${scheduleType}Schedule`]?.map((stop, index) => (
                  <TableRow key={index}>
                    <TableCell>{stop.name}</TableCell>
                    <TableCell>{stop.time}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}

export default Schedule;
