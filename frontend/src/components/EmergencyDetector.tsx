import React, { useEffect, useState } from 'react';
// import { Accelerometer } from 'expo-sensors';
// import * as Location from 'expo-location';
const Accelerometer = {
  setUpdateInterval: (num: any) => {},
  addListener: (cb: any) => ({ remove: () => {} })
};
const Location = {
  getForegroundPermissionsAsync: async () => ({ status: 'granted' }),
  getCurrentPositionAsync: async (options?: any) => ({ coords: { latitude: 13.0827, longitude: 80.2707 } })
};
import { useAuth } from '../context/AuthContext';
import { API_URL } from '../config/api';

const FALL_THRESHOLD = 3.5; // g-force threshold for a fall (rough estimate)

export function EmergencyDetector() {
  const [data, setData] = useState({ x: 0, y: 0, z: 0 });
  const [subscription, setSubscription] = useState<any>(null);
  const { token } = useAuth();

  useEffect(() => {
    _subscribe();
    return () => _unsubscribe();
  }, []);

  useEffect(() => {
    const checkFall = async () => {
      // Calculate total acceleration vector
      const totalG = Math.sqrt(data.x * data.x + data.y * data.y + data.z * data.z);
      
      if (totalG > FALL_THRESHOLD) {
        console.log('High impact detected! Simulating fall detection trigger.');
        await triggerEmergency();
        // Prevent multiple triggers immediately
        _unsubscribe();
        setTimeout(() => {
          _subscribe();
        }, 10000); // wait 10 seconds before re-enabling
      }
    };
    
    checkFall();
  }, [data]);

  const _subscribe = () => {
    Accelerometer.setUpdateInterval(500); // Check every 500ms
    setSubscription(
      Accelerometer.addListener((accelerometerData: any) => {
        setData(accelerometerData);
      })
    );
  };

  const _unsubscribe = () => {
    subscription && subscription.remove();
    setSubscription(null);
  };

  const triggerEmergency = async () => {
    try {
      let location: any = null;
      let { status } = await Location.getForegroundPermissionsAsync();
      
      if (status === 'granted') {
         location = await Location.getCurrentPositionAsync({});
      }

      await fetch(`${API_URL}/api/v1/notifications/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location ? location.coords.latitude : null,
          longitude: location ? location.coords.longitude : null,
          message: 'Automatic Fall Detected!',
        }),
      });
      console.log('Automatic SOS sent due to fall detection.');
    } catch (error) {
      console.error('Failed to send automatic SOS', error);
    }
  };

  // This is a background/invisible component, so it renders nothing
  return null;
}
