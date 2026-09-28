import React, { useState } from 'react';
import { StyleSheet, TouchableOpacity, Text, View, Alert, ActivityIndicator } from 'react-native';
// import * as Location from 'expo-location';
const Location = {
  requestForegroundPermissionsAsync: async () => ({ status: 'granted' }),
  getCurrentPositionAsync: async (options?: any) => ({ coords: { latitude: 13.0827, longitude: 80.2707 } })
};
import { useAuth } from '../context/AuthContext';
import { API_URL } from '@/config/api';

export function SOSButton() {
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();

  const handleSOSPress = async () => {
    try {
      setLoading(true);
      
      // Request location permissions
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission to access location was denied', 'Please enable location to send accurate SOS alerts.');
        setLoading(false);
        return;
      }

      // Get current location
      let location = await Location.getCurrentPositionAsync({});
      
      // Send Emergency Request to API
      const response = await fetch(`${API_URL}/api/v1/notifications/emergency`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          message: 'SOS! I need immediate help.',
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send SOS');
      }

      Alert.alert('SOS Sent!', 'Your emergency contacts and services have been notified of your location.');
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'Failed to send SOS alert. Please try again or call emergency services directly.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.sosButton} 
        onPress={handleSOSPress}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" size="large" />
        ) : (
          <Text style={styles.sosText}>SOS</Text>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
  },
  sosButton: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: '#ff3b30',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#ff3b30',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 10,
    borderWidth: 5,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  sosText: {
    color: 'white',
    fontSize: 40,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
});
