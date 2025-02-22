import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';
import { ref, onValue } from 'firebase/database';
import { database } from '../firebase';
import { Box, Paper, Typography, Alert } from '@mui/material';
import DirectionsBusIcon from '@mui/icons-material/DirectionsBus';

const containerStyle = {
  width: '100%',
  height: '80vh'
};

const defaultCenter = {
  lat: 40.7128, // Default to your college's coordinates
  lng: -74.0060
};

function BusMap() {
  const [buses, setBuses] = useState({});
  const [selectedBus, setSelectedBus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiKey = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

  useEffect(() => {
    if (!apiKey) {
      setError('Google Maps API key is missing');
      setLoading(false);
      return;
    }

    const busesRef = ref(database, 'buses');
    const unsubscribe = onValue(busesRef, (snapshot) => {
      const data = snapshot.val();
      setBuses(data || {});
      setLoading(false);
    }, (error) => {
      setError('Error loading bus data: ' + error.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [apiKey]);

  const handleLoadError = (error) => {
    console.error('Google Maps loading error:', error);
    setError('Failed to load Google Maps');
  };

  const handleMarkerClick = (bus) => {
    setSelectedBus(bus);
  };

  if (loading) {
    return <Typography>Loading map...</Typography>;
  }

  if (error) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="h5" gutterBottom>
          Live Bus Tracking
        </Typography>
      </Paper>
      
      <LoadScript 
        googleMapsApiKey={apiKey}
        onError={handleLoadError}
      >
        <GoogleMap
          mapContainerStyle={containerStyle}
          center={defaultCenter}
          zoom={14}
          options={{
            styles: [
              {
                featureType: "transit",
                elementType: "labels.icon",
                stylers: [{ visibility: "on" }],
              },
            ],
          }}
        >
          {Object.entries(buses).map(([busId, bus]) => (
            <Marker
              key={busId}
              position={{
                lat: bus.location?.latitude || defaultCenter.lat,
                lng: bus.location?.longitude || defaultCenter.lng
              }}
              icon={{
                path: DirectionsBusIcon,
                fillColor: '#1976d2',
                fillOpacity: 0.9,
                strokeWeight: 1,
                strokeColor: '#ffffff',
                scale: 2,
              }}
              onClick={() => handleMarkerClick(bus)}
            />
          ))}

          {selectedBus && (
            <InfoWindow
              position={{
                lat: selectedBus.location?.latitude || defaultCenter.lat,
                lng: selectedBus.location?.longitude || defaultCenter.lng
              }}
              onCloseClick={() => setSelectedBus(null)}
            >
              <Box>
                <Typography variant="subtitle1">
                  Bus {selectedBus.id}
                </Typography>
                <Typography variant="body2">
                  Route: {selectedBus.route}
                </Typography>
                <Typography variant="body2">
                  Speed: {selectedBus.location?.speed || 0} km/h
                </Typography>
                <Typography variant="body2">
                  Last Updated: {selectedBus.location?.lastUpdate ? new Date(selectedBus.location.lastUpdate).toLocaleTimeString() : 'N/A'}
                </Typography>
              </Box>
            </InfoWindow>
          )}
        </GoogleMap>
      </LoadScript>
    </Box>
  );
}

export default BusMap;
