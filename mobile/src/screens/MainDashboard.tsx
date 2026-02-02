/**
 * Main Dashboard Screen for React Native
 * Displays all home automation widgets
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withRepeat,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Shield,
  ShieldAlert,
  Thermometer,
  Droplets,
  Lightbulb,
  LightbulbOff,
  ChevronRight,
  Clock,
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

type ModalType = 'climate' | 'security' | 'garden' | null;

interface MainDashboardProps {
  onOpenModal: (modal: ModalType) => void;
}

export default function MainDashboard({ onOpenModal }: MainDashboardProps) {
  const [securityArmed, setSecurityArmed] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [temperature, setTemperature] = useState(22);

  const pulseOpacity = useSharedValue(1);

  const animatedPulse = useAnimatedStyle(() => ({
    opacity: securityArmed
      ? withRepeat(
          withSequence(withSpring(0.6), withSpring(1)),
          -1,
          false
        )
      : 1,
  }));

  const animatedProgress = useAnimatedStyle(() => ({
    width: withSpring('65%', { damping: 15 }),
  }));

  const handlePanicAlert = () => {
    Alert.alert('PANIC ALERT', 'PANIC ALERT TRIGGERED!', [
      { text: 'OK', onPress: () => {} },
    ]);
  };

  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return now.toLocaleDateString('en-US', options);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#121212', '#1a1a2e', '#121212']}
        style={styles.background}
      />

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Welcome Home</Text>
          <Text style={styles.subtitle}>{getCurrentDateTime()}</Text>
        </View>

        {/* Widget Grid */}
        <View style={styles.grid}>
          {/* Security Widget */}
          <TouchableOpacity
            style={styles.widget}
            onPress={() => onOpenModal('security')}
            activeOpacity={0.8}
          >
            <View style={styles.widgetHeader}>
              <View style={styles.widgetIconContainer}>
                {securityArmed ? (
                  <ShieldAlert size={24} color="#EF4444" strokeWidth={2} />
                ) : (
                  <Shield size={24} color="#22C55E" strokeWidth={2} />
                )}
              </View>
              <ChevronRight size={24} color="rgba(255,255,255,0.4)" strokeWidth={2} />
            </View>

            <View style={styles.widgetContent}>
              <Text style={styles.widgetTitle}>Security System</Text>
              <Text style={styles.widgetSubtitle}>Home Protection</Text>
            </View>

            <View style={styles.statusRow}>
              <Text style={styles.statusLabel}>Status:</Text>
              <Animated.View style={[styles.statusBadge, animatedPulse]}>
                <Text
                  style={[
                    styles.statusText,
                    securityArmed && styles.statusTextArmed,
                    !securityArmed && styles.statusTextDisarmed,
                  ]}
                >
                  {securityArmed ? 'Armed' : 'Disarmed'}
                </Text>
              </Animated.View>
            </View>

            <TouchableOpacity
              style={styles.panicButton}
              onPress={handlePanicAlert}
              activeOpacity={0.8}
            >
              <Text style={styles.panicButtonText}>🚨 Panic Alert</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          {/* Climate Widget */}
          <TouchableOpacity
            style={styles.widget}
            onPress={() => onOpenModal('climate')}
            activeOpacity={0.8}
          >
            <View style={styles.widgetHeader}>
              <View style={styles.widgetIconContainer}>
                <Thermometer size={24} color="#3B82F6" strokeWidth={2} />
              </View>
              <ChevronRight size={24} color="rgba(255,255,255,0.4)" strokeWidth={2} />
            </View>

            <View style={styles.widgetContent}>
              <Text style={styles.widgetTitle}>Climate Control</Text>
              <Text style={styles.widgetSubtitle}>Temperature & AC</Text>
            </View>

            <View style={styles.temperatureDisplay}>
              <Text style={styles.temperatureText}>{temperature}°C</Text>
              <Text style={styles.temperatureLabel}>Current Temperature</Text>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.quickButton, styles.coolButton]}
                onPress={() => setTemperature((t) => Math.max(16, t - 1))}
                activeOpacity={0.8}
              >
                <Text style={styles.quickButtonText}>❄️ Cool</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.quickButton, styles.heatButton]}
                onPress={() => setTemperature((t) => Math.min(30, t + 1))}
                activeOpacity={0.8}
              >
                <Text style={styles.quickButtonText}>🔥 Heat</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          {/* Garden Widget */}
          <TouchableOpacity
            style={styles.widget}
            onPress={() => onOpenModal('garden')}
            activeOpacity={0.8}
          >
            <View style={styles.widgetHeader}>
              <View style={styles.widgetIconContainer}>
                <Droplets size={24} color="#22C55E" strokeWidth={2} />
              </View>
              <ChevronRight size={24} color="rgba(255,255,255,0.4)" strokeWidth={2} />
            </View>

            <View style={styles.widgetContent}>
              <Text style={styles.widgetTitle}>Garden & Utilities</Text>
              <Text style={styles.widgetSubtitle}>Irrigation System</Text>
            </View>

            <View style={styles.nextWateringContainer}>
              <Clock size={20} color="#00E5FF" strokeWidth={2} />
              <View style={styles.nextWateringText}>
                <Text style={styles.nextWateringLabel}>Next Watering</Text>
                <Text style={styles.nextWateringTime}>18:00 Today</Text>
              </View>
            </View>

            <View style={styles.moistureContainer}>
              <View style={styles.moistureLabelRow}>
                <Text style={styles.moistureLabel}>Soil Moisture</Text>
                <Text style={styles.moistureValue}>65%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={styles.progressBackground} />
                <Animated.View style={[styles.progressFill, animatedProgress]} />
              </View>
            </View>
          </TouchableOpacity>

          {/* Lighting Widget */}
          <View style={styles.widget}>
            <View style={styles.widgetHeader}>
              <View
                style={[
                  styles.widgetIconContainer,
                  lightsOn && styles.widgetIconContainerActive,
                ]}
              >
                {lightsOn ? (
                  <Lightbulb size={24} color="#EAB308" strokeWidth={2} />
                ) : (
                  <LightbulbOff size={24} color="rgba(255,255,255,0.4)" strokeWidth={2} />
                )}
              </View>
            </View>

            <View style={styles.widgetContent}>
              <Text style={styles.widgetTitle}>Lighting Control</Text>
              <Text style={styles.widgetSubtitle}>All Rooms</Text>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Active Lights</Text>
                <Text style={styles.statValue}>{lightsOn ? '12' : '0'}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Energy</Text>
                <Text style={styles.statValue}>{lightsOn ? '240W' : '0W'}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.masterButton,
                lightsOn && styles.masterButtonOn,
              ]}
              onPress={() => setLightsOn(!lightsOn)}
              activeOpacity={0.8}
            >
              <Text style={styles.masterButtonText}>
                {lightsOn ? '💡 Turn All Off' : '🔦 Turn All On'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 16,
  },
  widget: {
    width: (width - 48) / 2,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  widgetIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  widgetIconContainerActive: {
    backgroundColor: 'rgba(234, 179, 0, 0.2)',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 10,
  },
  widgetContent: {
    marginBottom: 16,
  },
  widgetTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  widgetSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusTextArmed: {
    color: '#EF4444',
  },
  statusTextDisarmed: {
    color: '#22C55E',
  },
  panicButton: {
    backgroundColor: 'linear-gradient(90deg, #FF2E2E, #D41F1F)',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#FF2E2E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  panicButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  temperatureDisplay: {
    alignItems: 'center',
    marginVertical: 24,
  },
  temperatureText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  temperatureLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  coolButton: {
    borderColor: 'rgba(0, 229, 255, 0.5)',
  },
  heatButton: {
    borderColor: 'rgba(255, 165, 0, 0.5)',
  },
  quickButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  nextWateringContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  nextWateringText: {
    flex: 1,
  },
  nextWateringLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  nextWateringTime: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  moistureContainer: {
    gap: 8,
  },
  moistureLabelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  moistureLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  moistureValue: {
    fontSize: 14,
    color: '#00E5FF',
    fontWeight: '600',
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: 'linear-gradient(90deg, #22C55E, #00E5FF)',
    borderRadius: 4,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  statBox: {
    flex: 1,
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
  },
  statLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  masterButton: {
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  masterButtonOn: {
    backgroundColor: 'linear-gradient(90deg, #EAB308, #F97316)',
    borderColor: 'transparent',
    shadowColor: '#EAB308',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  masterButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
