/**
 * Climate Modal Screen for React Native
 * Temperature control and climate settings
 */

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Dimensions,
  ScrollView,
  PanResponder,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { SafeAreaView } from 'react-native-safe-area-context';
import { X, Wind, Zap } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface ClimateModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ClimateModal({ visible, onClose }: ClimateModalProps) {
  const [temperature, setTemperature] = useState(22);
  const [fanSpeed, setFanSpeed] = useState<'low' | 'med' | 'high'>('med');
  const [mode, setMode] = useState<'cool' | 'heat' | 'eco'>('cool');
  const [isDragging, setIsDragging] = useState(false);

  const dialRotation = useSharedValue(0);
  const scaleValue = useSharedValue(1);

  const getRotationAngle = () => {
    return ((temperature - 16) / 14) * 360;
  };

  const animatedRotation = useAnimatedStyle(() => ({
    transform: [{ rotate: `${dialRotation.value}deg` }],
  }));

  const animatedScale = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  const handleDialPress = (event: any) => {
    const { locationX, locationY } = event.nativeEvent;
    const centerX = width / 2 - 32;
    const centerY = height / 2 - 200;
    const angle = Math.atan2(locationY - centerY, locationX - centerX);
    const degrees = (angle * 180) / Math.PI + 90;
    const normalizedDegrees = (degrees + 360) % 360;
    const temp = Math.round(16 + (normalizedDegrees / 360) * 14);
    setTemperature(Math.max(16, Math.min(30, temp)));
    dialRotation.value = withSpring(normalizedDegrees);
  };

  const handleFanSpeed = (speed: 'low' | 'med' | 'high') => {
    setFanSpeed(speed);
  };

  const handleMode = (m: 'cool' | 'heat' | 'eco') => {
    setMode(m);
  };

  const handleApply = () => {
    // Apply settings via API
    onClose();
  };

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
                colors={['rgba(59, 130, 246, 0.1)', 'transparent']}
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
                  <Text style={styles.title}>Climate Control</Text>
                  <Text style={styles.subtitle}>
                    Adjust temperature and settings
                  </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.content}>
                    {/* Circular Dial */}
                    <View style={styles.dialContainer}>
                      <View style={styles.dialOuterRing} />
                      <TouchableOpacity
                        style={styles.dial}
                        onPress={handleDialPress}
                        activeOpacity={0.9}
                      >
                        {/* Temperature marks */}
                        {[16, 18, 20, 22, 24, 26, 28, 30].map((temp) => {
                          const angle = ((temp - 16) / 14) * 360 - 90;
                          const rad = (angle * Math.PI) / 180;
                          const x = Math.cos(rad) * 110;
                          const y = Math.sin(rad) * 110;

                          return (
                            <Text
                              key={temp}
                              style={[
                                styles.tempMark,
                                {
                                  left: `calc(50% + ${x}px)`,
                                  top: `calc(50% + ${y}px)`,
                                },
                              ]}
                            >
                              {temp}°
                            </Text>
                          );
                        })}

                        {/* Center display */}
                        <View style={styles.dialCenter}>
                          <Animated.Text style={[styles.temperatureText, animatedScale]}>
                            {temperature}°
                          </Animated.Text>
                          <Text style={styles.targetLabel}>Target Temp</Text>
                        </View>

                        {/* Draggable handle */}
                        <Animated.View
                          style={[
                            styles.dialHandle,
                            animatedRotation,
                          ]}
                        >
                          <View style={styles.dialHandleInner} />
                        </Animated.View>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Controls */}
                  <View style={styles.controls}>
                    {/* Fan Speed */}
                    <View style={styles.controlSection}>
                      <Text style={styles.controlLabel}>
                        <Wind size={16} color="#FFFFFF" strokeWidth={2} /> Fan Speed
                      </Text>
                      <View style={styles.buttonGroup}>
                        {(['low', 'med', 'high'] as const).map((speed) => (
                          <TouchableOpacity
                            key={speed}
                            style={[
                              styles.controlButton,
                              fanSpeed === speed && styles.controlButtonActive,
                              fanSpeed === speed && styles.controlButtonFan,
                            ]}
                            onPress={() => handleFanSpeed(speed)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.controlButtonText}>
                              {speed === 'low' && '🌬️ Low'}
                              {speed === 'med' && '💨 Med'}
                              {speed === 'high' && '🌪️ High'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Mode */}
                    <View style={styles.controlSection}>
                      <Text style={styles.controlLabel}>
                        <Zap size={16} color="#FFFFFF" strokeWidth={2} /> Mode
                      </Text>
                      <View style={styles.buttonGroup}>
                        {(['cool', 'heat', 'eco'] as const).map((m) => (
                          <TouchableOpacity
                            key={m}
                            style={[
                              styles.controlButton,
                              mode === m && styles.controlButtonActive,
                              mode === m && m === 'cool' && styles.controlButtonCool,
                              mode === m && m === 'heat' && styles.controlButtonHeat,
                              mode === m && m === 'eco' && styles.controlButtonEco,
                            ]}
                            onPress={() => handleMode(m)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.controlButtonText}>
                              {m === 'cool' && '❄️ Cool'}
                              {m === 'heat' && '🔥 Heat'}
                              {m === 'eco' && '🌿 Eco'}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>

                    {/* Status Info */}
                    <View style={styles.statusInfo}>
                      <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Current Temp:</Text>
                        <Text style={styles.statusValue}>21°C</Text>
                      </View>
                      <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Humidity:</Text>
                        <Text style={styles.statusValue}>45%</Text>
                      </View>
                      <View style={styles.statusRow}>
                        <Text style={styles.statusLabel}>Power Usage:</Text>
                        <Text style={styles.statusValue}>1.2 kW</Text>
                      </View>
                    </View>

                    {/* Apply Button */}
                    <TouchableOpacity
                      style={styles.applyButton}
                      onPress={handleApply}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.applyButtonText}>Apply Settings</Text>
                    </TouchableOpacity>
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
    maxWidth: 700,
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
    gap: 32,
  },
  dialContainer: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  dialOuterRing: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  dial: {
    width: 256,
    height: 256,
    borderRadius: 128,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  tempMark: {
    position: 'absolute',
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  dialCenter: {
    alignItems: 'center',
  },
  temperatureText: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  targetLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  dialHandle: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 15,
    elevation: 10,
  },
  dialHandleInner: {
    position: 'absolute',
    inset: 2,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  controls: {
    gap: 24,
  },
  controlSection: {
    gap: 12,
  },
  controlLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  buttonGroup: {
    flexDirection: 'row',
    gap: 8,
  },
  controlButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  controlButtonActive: {
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.4,
    shadowRadius: 20,
    elevation: 10,
  },
  controlButtonFan: {
    borderColor: '#00E5FF',
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
  },
  controlButtonCool: {
    borderColor: '#3B82F6',
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
  },
  controlButtonHeat: {
    borderColor: '#F97316',
    backgroundColor: 'rgba(249, 115, 22, 0.2)',
  },
  controlButtonEco: {
    borderColor: '#22C55E',
    backgroundColor: 'rgba(34, 197, 94, 0.2)',
  },
  controlButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusInfo: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    gap: 8,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  statusValue: {
    fontSize: 14,
    color: '#00E5FF',
    fontWeight: '600',
  },
  applyButton: {
    backgroundColor: 'linear-gradient(90deg, #00E5FF, #0077FF)',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  applyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});
