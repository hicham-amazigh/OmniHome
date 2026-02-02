/**
 * Authentication Screen for React Native
 * PIN entry and biometric authentication
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
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
import { Eye, Fingerprint } from 'lucide-react-native';
import { useAuth } from '@/contexts/AuthContext';

const { width } = Dimensions.get('window');

export default function AuthenticationScreen() {
  const [pin, setPin] = useState('');
  const [status, setStatus] = useState<'locked' | 'scanning' | 'error'>('locked');
  const [isScanning, setIsScanning] = useState(false);
  const { loginPin } = useAuth();

  const rotation = useSharedValue(0);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);

      // Auto-authenticate when 4 digits entered (demo purposes)
      if (newPin.length === 4) {
        setTimeout(() => {
          loginPin(newPin).catch(() => {
            setStatus('error');
            setTimeout(() => setStatus('locked'), 2000);
          });
        }, 500);
      }
    }
  };

  const handleClear = () => {
    setPin('');
    setStatus('locked');
  };

  const handleBiometric = () => {
    setIsScanning(true);
    setStatus('scanning');

    // Simulate biometric scan
    rotation.value = withRepeat(
      withSequence(
        withSpring(360, { damping: 10 }),
        withSpring(0, { damping: 10 })
      ),
      -1,
      false
    );

    setTimeout(() => {
      loginPin('1234').catch(() => {
        setStatus('error');
        setTimeout(() => setStatus('locked'), 2000);
      });
    }, 2000);
  };

  const animatedRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedOpacity = useAnimatedStyle(() => ({
    opacity: isScanning ? 0.5 : 1,
  }));

  const animatedDotScale = useAnimatedStyle(() => ({
    transform: [{ scale: pin.length > 0 ? withSpring(1.2) : 1 }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#121212', '#1a1a2e', '#121212']}
        style={styles.background}
      />

      <View style={styles.content}>
        {/* Glassmorphism card */}
        <View style={styles.card}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <Eye size={40} color="#00E5FF" strokeWidth={2} />
            </View>
            <Text style={styles.title}>OmniHome</Text>
            <Text style={styles.subtitle}>Central Control System</Text>
          </View>

          {/* Status indicator */}
          <Animated.View style={[styles.statusContainer, animatedOpacity]}>
            <View
              style={[
                styles.statusBadge,
                status === 'locked' && styles.statusLocked,
                status === 'scanning' && styles.statusScanning,
                status === 'error' && styles.statusError,
              ]}
            >
              <Text style={styles.statusText}>
                {status === 'locked' && '🔒 System Locked'}
                {status === 'scanning' && '🔍 Scanning...'}
                {status === 'error' && '❌ Access Denied'}
              </Text>
            </View>
          </Animated.View>

          {/* PIN Display */}
          <View style={styles.pinDisplay}>
            {[0, 1, 2, 3].map((i) => (
              <View
                key={i}
                style={[
                  styles.pinDot,
                  pin.length > i && styles.pinDotFilled,
                ]}
              >
                {pin.length > i && <View style={styles.pinDotInner} />}
              </View>
            ))}
          </View>

          {/* Numeric Keypad */}
          <View style={styles.keypad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <TouchableOpacity
                key={num}
                style={styles.keypadButton}
                onPress={() => handleNumberClick(num.toString())}
                activeOpacity={0.7}
              >
                <Text style={styles.keypadButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.keypadButton}
              onPress={handleClear}
              activeOpacity={0.7}
            >
              <Text style={styles.keypadButtonText}>CLR</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.keypadButton}
              onPress={() => handleNumberClick('0')}
              activeOpacity={0.7}
            >
              <Text style={styles.keypadButtonText}>0</Text>
            </TouchableOpacity>

            <View style={styles.keypadButton} />
          </View>

          {/* Biometric Scan Button */}
          <TouchableOpacity
            style={styles.biometricButton}
            onPress={handleBiometric}
            disabled={isScanning}
            activeOpacity={0.8}
          >
            <Animated.View style={animatedRotation}>
              <Fingerprint size={24} color="#FFFFFF" strokeWidth={2} />
            </Animated.View>
            <Text style={styles.biometricButtonText}>Biometric Scan</Text>
          </TouchableOpacity>

          {/* Hint text */}
          <Text style={styles.hintText}>
            Enter any 4-digit PIN or use biometric scan
          </Text>
        </View>
      </View>
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
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 24,
    padding: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'linear-gradient(135deg, #00E5FF, #0077FF)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#00E5FF',
  },
  statusContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  statusBadge: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 20,
  },
  statusLocked: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusScanning: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
  },
  statusError: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pinDisplay: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 32,
  },
  pinDot: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinDotFilled: {
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  pinDotInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#00E5FF',
  },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 24,
  },
  keypadButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  keypadButtonText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  biometricButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    width: '100%',
    height: 64,
    borderRadius: 12,
    backgroundColor: 'linear-gradient(90deg, #00E5FF, #0077FF)',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  biometricButtonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  hintText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
    textAlign: 'center',
    marginTop: 16,
  },
});
