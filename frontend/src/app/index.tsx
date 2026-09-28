import { Redirect } from 'expo-router';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useEffect, useState } from 'react';

import { AppColors } from '@/constants/colors';
import { useAuth } from '@/context/AuthContext';

export default function SplashScreen() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showRoute, setShowRoute] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      const timer = setTimeout(() => setShowRoute(true), 900);
      return () => clearTimeout(timer);
    }
  }, [isLoading]);

  if (showRoute) return <Redirect href={isAuthenticated ? '/dashboard' : '/login'} />;

  return (
    <View style={styles.container}>
      <View style={styles.mark}><Text style={styles.markText}>S</Text></View>
      <Text style={styles.brand}>silambu</Text>
      <Text style={styles.tagline}>Smart child safety</Text>
      <ActivityIndicator color={AppColors.teal} style={styles.loader} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: AppColors.canvas },
  mark: { width: 76, height: 76, borderRadius: 24, backgroundColor: AppColors.ink, alignItems: 'center', justifyContent: 'center' },
  markText: { color: '#fff', fontSize: 42, fontWeight: '800' },
  brand: { color: AppColors.ink, fontSize: 36, fontWeight: '800', marginTop: 18, letterSpacing: 1 },
  tagline: { color: AppColors.muted, fontSize: 15, marginTop: 6 },
  loader: { marginTop: 42 },
});
