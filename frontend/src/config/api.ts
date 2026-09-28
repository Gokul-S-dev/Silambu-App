import { Platform } from 'react-native';
import Constants from 'expo-constants';

let detectedHost = null;
const hostUri = Constants.expoConfig?.hostUri;
if (hostUri) {
  detectedHost = hostUri.split(":")[0];
}

const getApiUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:8000';
  } else if (Platform.OS === 'android') {
    return detectedHost ? `http://${detectedHost}:8000` : 'http://10.0.2.2:8000';
  }
  return 'http://localhost:8000';
};

export const API_URL = getApiUrl();
