import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { AppColors } from '@/constants/colors';

const generateDynamicReadings = () => {
    const readings = [];
    const now = Date.now();
    
    // Determine a random scenario for this batch to get different predictions
    const scenarios = ["walking", "running", "fall", "emergency", "stationary"];
    const currentScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    let baseHR = 80;
    let baseSpeed = 1.5;
    let baseAccel = 1.0;
    
    if (currentScenario === "running") {
        baseHR = 130;
        baseSpeed = 6.0;
        baseAccel = 2.5;
    } else if (currentScenario === "fall") {
        baseHR = 160;
        baseSpeed = 0.5;
        baseAccel = 15.0;
    } else if (currentScenario === "emergency") {
        baseHR = 180;
        baseSpeed = 0.0;
        baseAccel = 0.5;
    } else if (currentScenario === "stationary") {
        baseHR = 70;
        baseSpeed = 0.0;
        baseAccel = 0.1;
    }

    for (let i = 0; i < 30; i++) {
        const timestamp = new Date(now - (29 - i) * 1000).toISOString();
        
        // Add some random noise
        const hrNoise = Math.floor(Math.random() * 10) - 5;
        const speedNoise = (Math.random() * 1) - 0.5;
        const accelNoise = (Math.random() * 2) - 1;

        readings.push({
            timestamp,
            heart_rate: Math.max(60, baseHR + hrNoise),
            spo2: Math.floor(Math.random() * (100 - 92 + 1)) + 92,
            accel_x: Math.max(0.1, baseAccel + accelNoise),
            accel_y: Math.max(0.1, baseAccel + accelNoise),
            accel_z: (currentScenario === 'fall' ? 18.0 : 9.8) + accelNoise,
            gyro_x: Math.random() * (currentScenario === 'fall' ? 10 : 1),
            gyro_y: Math.random() * (currentScenario === 'fall' ? 10 : 1),
            gyro_z: Math.random() * (currentScenario === 'fall' ? 10 : 1),
            latitude: 12.9501 + (Math.random() * 0.001),
            longitude: 77.5800 + (Math.random() * 0.001),
            speed: Math.max(0, baseSpeed + speedNoise),
            activity: currentScenario,
            tamper: 0,
            sos: currentScenario === "emergency" ? 1 : 0,
            scenario: currentScenario
        });
    }
    
    return readings;
};

  
  export const MLTest = () => {
      const [result, setResult] = useState<any>(null);
      const [pollCount, setPollCount] = useState(0);
      const [isActive, setIsActive] = useState(true);
      
      // Auto-poll logic
      useEffect(() => {
          let timer: ReturnType<typeof setTimeout>;
          if (isActive) {
              timer = setInterval(async () => {
                  try {
                      const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
                      const dynamicData = generateDynamicReadings();
                      // Send the full array of 30 readings on each poll to satisfy ML model
                      const response = await fetch(`${apiUrl}/api/v1/iot/predict`, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json'
                          },
                          body: JSON.stringify({ readings: dynamicData })
                      });
                      
                      const data = await response.json();
                      setResult(data);
                  } catch (error: any) {
                      console.error("ML Model Predict Error:", error);
                  }
                  
                  setPollCount(p => p + 1);
              }, 3000); // Trigger every 3 seconds
          }
          
          return () => clearInterval(timer);
      }, [isActive]);
  
      return (
          <View style={styles.container}>
              <View style={styles.headerRow}>
                  <Text style={styles.title}>Live ML Monitoring Test</Text>
                  {isActive && <ActivityIndicator size="small" color={AppColors.teal} />}
              </View>
              <Text style={styles.subtitle}>Sending 30 sensor readings every 3s...</Text>
              
              <View style={styles.readingBox}>
                  <Text style={styles.label}>Total API calls: {pollCount}</Text>
                  <Text style={styles.dataText}>Generating dynamic readings ending at {new Date().toLocaleTimeString()}</Text>
              </View>
              
              <View style={styles.resultWrapper}>
                  <Text style={styles.resultLabel}>Latest Prediction:</Text>
                  <View style={styles.resultContainer}>
                      <Text style={styles.resultText}>
                          {result ? JSON.stringify(result, null, 2) : "Awaiting prediction..."}
                      </Text>
                  </View>
              </View>
          </View>
      );
  };

const styles = StyleSheet.create({
    container: {
        padding: 16,
        marginVertical: 12,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        // removed shadow properties that cause warnings
        boxShadow: '0px 2px 4px rgba(0,0,0,0.05)', 
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    title: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#1f2937',
    },
    subtitle: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 12,
        marginTop: 4,
    },
    readingBox: {
        backgroundColor: '#f3f4f6',
        padding: 10,
        borderRadius: 8,
        marginBottom: 12,
    },
    label: {
        fontSize: 12,
        fontWeight: '600',
        color: '#4b5563',
        marginBottom: 4,
    },
    dataText: {
        fontSize: 11,
        color: '#374151',
    },
    resultWrapper: {
        marginTop: 4,
    },
    resultLabel: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 8,
        color: '#4b5563',
    },
    resultContainer: {
        backgroundColor: '#e0f2fe', // light blue to indicate result
        padding: 12,
        borderRadius: 8,
    },
    resultText: {
        fontSize: 12,
        color: '#0369a1',
        fontWeight: '500',
    }
});
