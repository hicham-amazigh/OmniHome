/**
 * Main App Entry Point
 * Handles authentication and routing
 */

import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import AuthenticationScreen from '@/screens/AuthenticationScreen';
import MainDashboard from '@/screens/MainDashboard';
import ClimateModal from '@/screens/ClimateModal';
import SecurityModal from '@/screens/SecurityModal';
import GardenModal from '@/screens/GardenModal';

type ModalType = 'climate' | 'security' | 'garden' | null;

export default function App() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#121212', '#1a1a2e', '#121212']}
          style={styles.background}
        />
      </SafeAreaView>
    );
  }

  if (!isAuthenticated) {
    return <AuthenticationScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#121212', '#1a1a2e', '#121212']}
        style={styles.background}
      />

      <MainDashboard onOpenModal={setActiveModal} />

      {/* Modals */}
      <ClimateModal
        visible={activeModal === 'climate'}
        onClose={() => setActiveModal(null)}
      />

      <SecurityModal
        visible={activeModal === 'security'}
        onClose={() => setActiveModal(null)}
      />

      <GardenModal
        visible={activeModal === 'garden'}
        onClose={() => setActiveModal(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  background: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
});
