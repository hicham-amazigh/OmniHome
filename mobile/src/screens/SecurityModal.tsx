/**
 * Security Modal Screen for React Native
 * Security system controls and monitoring
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
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
import { X, DoorClosed, DoorOpen, AlertTriangle, Camera, Clock } from 'lucide-react-native';

type GarageState = 'closed' | 'opening' | 'open' | 'obstacle';

interface SecurityModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function SecurityModal({ visible, onClose }: SecurityModalProps) {
  const [garageState, setGarageState] = useState<GarageState>('closed');
  const [logEntries] = useState([
    { time: '10:00 AM', event: 'Front Door Opened', type: 'info' },
    { time: '09:45 AM', event: 'Garage Door Closed', type: 'info' },
    { time: '09:30 AM', event: 'Motion Detected - Driveway', type: 'warning' },
    { time: '08:15 AM', event: 'System Armed', type: 'success' },
  ]);

  const rotation = useSharedValue(0);

  const handleGarageDoor = () => {
    if (garageState === 'closed') {
      setGarageState('opening');
      setTimeout(() => {
        setGarageState('open');
      }, 2000);
    } else if (garageState === 'open') {
      setGarageState('closed');
    } else if (garageState === 'obstacle') {
      setGarageState('closed');
    }
  };

  const getGarageButtonColor = () => {
    switch (garageState) {
      case 'closed':
        return {
          backgroundColor: 'rgba(34, 197, 94, 0.2)',
          borderColor: '#22C55E',
        };
      case 'opening':
        return {
          backgroundColor: 'rgba(234, 179, 8, 0.2)',
          borderColor: '#EAB308',
        };
      case 'open':
        return {
          backgroundColor: 'rgba(59, 130, 246, 0.2)',
          borderColor: '#3B82F6',
        };
      case 'obstacle':
        return {
          backgroundColor: 'rgba(239, 68, 68, 0.2)',
          borderColor: '#EF4444',
        };
    }
  };

  const getGarageButtonText = () => {
    switch (garageState) {
      case 'closed':
        return '🚪 Open Garage';
      case 'opening':
        return '⏳ Opening...';
      case 'open':
        return '🚪 Close Garage';
      case 'obstacle':
        return '⚠️ Obstacle Detected!';
    }
  };

  const animatedRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const animatedPulse = useAnimatedStyle(() => ({
    opacity: garageState === 'obstacle'
      ? withRepeat(
          withSequence(withSpring(1.2), withSpring(1)),
          -1,
          false
        )
      : 1,
  }));

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.overlay}>
        <TouchableOpacity style={styles.overlayTouchable} onPress={onClose} activeOpacity={1}>
          <View style={styles.modalContainer}>
            <TouchableOpacity activeOpacity={1}>
              <LinearGradient
                colors={['rgba(239, 68, 68, 0.1)', 'transparent']}
                style={styles.modal}
              >
                {/* Close button */}
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <X size={20} color="#FFFFFF" strokeWidth={2} />
                </TouchableOpacity>

                {/* Header */}
                <View style={styles.header}>
                  <Text style={styles.title}>Security & Access</Text>
                  <Text style={styles.subtitle}>
                    Monitor and control entry points
                  </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.content}>
                    {/* Left Column */}
                    <View style={styles.column}>
                      {/* Garage Door Control */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          {garageState === 'closed' && (
                            <DoorClosed size={20} color="#22C55E" strokeWidth={2} />
                          )}
                          {garageState === 'obstacle' && (
                            <AlertTriangle size={20} color="#EF4444" strokeWidth={2} />
                          )}
                          {garageState === 'open' && (
                            <DoorOpen size={20} color="#3B82F6" strokeWidth={2} />
                          )}
                          {' Garage Door'}
                        </Text>

                        {/* Visual Status */}
                        <View style={styles.garageVisual}>
                          <Animated.View style={[styles.garageStatus, animatedPulse]}>
                            {garageState === 'closed' && (
                              <DoorClosed size={64} color="#22C55E" strokeWidth={2} />
                            )}
                            {garageState === 'opening' && (
                              <Animated.View style={animatedRotation}>
                                <Text style={styles.loadingText}>⏳</Text>
                              </Animated.View>
                            )}
                            {garageState === 'open' && (
                              <DoorOpen size={64} color="#3B82F6" strokeWidth={2} />
                            )}
                            {garageState === 'obstacle' && (
                              <AlertTriangle size={64} color="#EF4444" strokeWidth={2} />
                            )}
                          </Animated.View>
                        </View>

                        {/* Control Button */}
                        <TouchableOpacity
                          style={[
                            styles.garageButton,
                            getGarageButtonColor(),
                          ]}
                          onPress={handleGarageDoor}
                          disabled={garageState === 'opening'}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.garageButtonText}>
                            {getGarageButtonText()}
                          </Text>
                        </TouchableOpacity>

                        {/* Status Text */}
                        <Text style={styles.garageStatusText}>
                          {garageState === 'obstacle' &&
                            '⚠️ Obstacle detected - Door reversed'}
                          {garageState === 'opening' && 'System responding...'}
                          {garageState === 'closed' && 'Door is secured'}
                          {garageState === 'open' && 'Door is open'}
                        </Text>
                      </View>

                      {/* Additional Controls */}
                      <View style={styles.buttonRow}>
                        <TouchableOpacity
                          style={styles.doorButton}
                          activeOpacity={0.8}
                        >
                          <DoorClosed size={24} color="#00E5FF" strokeWidth={2} />
                          <Text style={styles.doorButtonText}>Front Door</Text>
                          <Text style={styles.doorButtonSubtext}>Locked</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.doorButton}
                          activeOpacity={0.8}
                        >
                          <DoorClosed size={24} color="#00E5FF" strokeWidth={2} />
                          <Text style={styles.doorButtonText}>Back Door</Text>
                          <Text style={styles.doorButtonSubtext}>Locked</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Right Column */}
                    <View style={styles.column}>
                      {/* Live Camera Feed */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          <Camera size={20} color="#00E5FF" strokeWidth={2} /> Live Camera
                          Feed
                        </Text>

                        {/* Camera placeholder */}
                        <View style={styles.cameraPlaceholder}>
                          <View style={styles.cameraContent}>
                            <Camera size={48} color="#00E5FF" strokeWidth={2} />
                            <Text style={styles.cameraText}>Driveway Camera</Text>
                            <Animated.View
                              style={[
                                styles.liveIndicator,
                                {
                                  opacity: withRepeat(
                                    withSequence(withSpring(0.5), withSpring(1)),
                                    -1,
                                    false
                                  ),
                                },
                              ]}
                            >
                              <View style={styles.liveDot} />
                            </Animated.View>
                            <Text style={styles.liveText}>● LIVE</Text>
                          </View>

                          {/* Camera grid overlay */}
                          <View style={styles.cameraGrid}>
                            {Array.from({ length: 9 }).map((_, i) => (
                              <View key={i} style={styles.gridCell} />
                            ))}
                          </View>
                        </View>

                        {/* Camera controls */}
                        <View style={styles.cameraControls}>
                          <TouchableOpacity
                            style={styles.cameraButton}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.cameraButtonText}>📸 Snapshot</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.cameraButton}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.cameraButtonText}>🎥 Record</Text>
                          </TouchableOpacity>
                        </View>
                      </View>

                      {/* Activity Log */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          <Clock size={20} color="#00E5FF" strokeWidth={2} /> Activity Log
                        </Text>

                        <View style={styles.logContainer}>
                          {logEntries.map((entry, index) => (
                            <View key={index} style={styles.logEntry}>
                              <View style={styles.logContent}>
                                <Text style={styles.logEvent}>{entry.event}</Text>
                                <Text style={styles.logTime}>{entry.time}</Text>
                              </View>
                              <View
                                style={[
                                  styles.logDot,
                                  entry.type === 'success' && styles.logDotSuccess,
                                  entry.type === 'warning' && styles.logDotWarning,
                                  entry.type === 'info' && styles.logDotInfo,
                                ]}
                              />
                            </View>
                          </View>
                        ))}
                        </View>
                      </View>
                    </View>
                  </View>
                </ScrollView>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  overlayTouchable: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalContainer: {
    width: '100%',
    maxWidth: 900,
  },
  modal: {
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
  closeButton: {
    position: 'absolute',
    top: 24,
    right: 24,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  content: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 24,
  },
  column: {
    flex: 1,
    minWidth: 300,
    gap: 24,
  },
  section: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  garageVisual: {
    height: 128,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  garageStatus: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 48,
  },
  garageButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 2,
  },
  garageButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  garageStatusText: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    textAlign: 'center',
    marginTop: 12,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  doorButton: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  doorButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  doorButtonSubtext: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  cameraPlaceholder: {
    aspectRatio: 16 / 9,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    overflow: 'hidden',
    marginBottom: 12,
  },
  cameraContent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cameraText: {
    fontSize: 16,
    color: '#00E5FF',
    marginTop: 8,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  liveDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  liveText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  cameraGrid: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridCell: {
    width: '33.33%',
    height: '33.33%',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cameraControls: {
    flexDirection: 'row',
    gap: 8,
  },
  cameraButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  cameraButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  logContainer: {
    gap: 8,
    maxHeight: 200,
  },
  logEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  logContent: {
    flex: 1,
  },
  logEvent: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  logTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  logDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  logDotSuccess: {
    backgroundColor: '#22C55E',
  },
  logDotWarning: {
    backgroundColor: '#EAB308',
  },
  logDotInfo: {
    backgroundColor: '#3B82F6',
  },
});
