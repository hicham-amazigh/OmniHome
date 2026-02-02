/**
 * Garden Modal Screen for React Native
 * Irrigation system and water tank controls
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  ScrollView,
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
import { X, Droplets, Clock, Waves } from 'lucide-react-native';

interface GardenModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function GardenModal({ visible, onClose }: GardenModalProps) {
  const [activeZones, setActiveZones] = useState<number[]>([]);
  const [wateringTime, setWateringTime] = useState(18);
  const [tankLevel, setTankLevel] = useState(75);

  const toggleZone = (zone: number) => {
    setActiveZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const isZoneActive = (zone: number) => activeZones.includes(zone);

  const animatedWave = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withRepeat(
          withSequence(withSpring(-4), withSpring(4)),
          -1,
          false
        ),
      },
    ],
  }));

  const animatedTankLevel = useAnimatedStyle(() => ({
    height: withSpring(`${tankLevel}%`),
  }));

  const animatedPulse = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(withSpring(0.6), withSpring(1)),
      -1,
      false
    ),
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
                colors={['rgba(34, 197, 94, 0.1)', 'rgba(59, 130, 246, 0.1)', 'transparent']}
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
                  <Text style={styles.title}>Garden & Utilities</Text>
                  <Text style={styles.subtitle}>
                    Manage irrigation and water systems
                  </Text>
                </View>

                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={styles.content}>
                    {/* Left: Zone Map */}
                    <View style={styles.column}>
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          <Droplets size={20} color="#22C55E" strokeWidth={2} /> Irrigation
                          Zones
                        </Text>

                        {/* House/Garden Map */}
                        <View style={styles.zoneMap}>
                          {/* House representation */}
                          <View style={styles.house}>
                            <Text style={styles.houseEmoji}>🏠</Text>
                          </View>

                          {/* Zone 1 - Front Yard */}
                          <TouchableOpacity
                            style={[
                              styles.zoneButton,
                              isZoneActive(1) && styles.zoneButtonActive,
                            ]}
                            onPress={() => toggleZone(1)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.zoneEmoji}>💧</Text>
                            <Text style={styles.zoneLabel}>Zone 1</Text>
                            {isZoneActive(1) && (
                              <Animated.View style={[styles.zonePulse, animatedPulse]} />
                            )}
                          </TouchableOpacity>

                          {/* Zone 2 - Back Yard */}
                          <TouchableOpacity
                            style={[
                              styles.zoneButton,
                              isZoneActive(2) && styles.zoneButtonActive,
                            ]}
                            onPress={() => toggleZone(2)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.zoneEmoji}>🌿</Text>
                            <Text style={styles.zoneLabel}>Zone 2</Text>
                            {isZoneActive(2) && (
                              <Animated.View style={[styles.zonePulse, animatedPulse]} />
                            )}
                          </TouchableOpacity>

                          {/* Zone 3 - Side Garden */}
                          <TouchableOpacity
                            style={[
                              styles.zoneButton,
                              isZoneActive(3) && styles.zoneButtonActive,
                            ]}
                            onPress={() => toggleZone(3)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.zoneEmoji}>🌱</Text>
                            <Text style={styles.zoneLabel}>Zone 3</Text>
                            {isZoneActive(3) && (
                              <Animated.View style={[styles.zonePulse, animatedPulse]} />
                            )}
                          </TouchableOpacity>
                        </View>

                        {/* Zone Status */}
                        <View style={styles.zoneStatus}>
                          <Text style={styles.zoneStatusLabel}>Active Zones:</Text>
                          {activeZones.length === 0 ? (
                            <Text style={styles.zoneStatusValue}>No zones active</Text>
                          ) : (
                            <View style={styles.activeZonesContainer}>
                              {activeZones.map((zone) => (
                                <View key={zone} style={styles.activeZoneBadge}>
                                  <Text style={styles.activeZoneText}>Zone {zone}</Text>
                                </View>
                              ))}
                            </View>
                          )}
                        </View>

                        {/* Control Buttons */}
                        <View style={styles.buttonRow}>
                          <TouchableOpacity
                            style={styles.allOnButton}
                            onPress={() => setActiveZones([1, 2, 3])}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.allOnButtonText}>💧 All On</Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.allOffButton}
                            onPress={() => setActiveZones([])}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.allOffButtonText}>🛑 All Off</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>

                    {/* Right: Settings */}
                    <View style={styles.column}>
                      {/* Watering Schedule */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          <Clock size={20} color="#00E5FF" strokeWidth={2} /> Watering
                          Schedule
                        </Text>

                        <View style={styles.scheduleContainer}>
                          <Text style={styles.scheduleLabel}>Next Watering Time</Text>

                          {/* Time Slider */}
                          <View style={styles.timeSliderContainer}>
                            <Text style={styles.timeLabel}>06:00</Text>
                            <Text style={styles.timeValue}>
                              {wateringTime.toString().padStart(2, '0')}:00
                            </Text>
                            <Text style={styles.timeLabel}>22:00</Text>
                          </View>

                          {/* Duration */}
                          <View style={styles.durationRow}>
                            {[15, 30, 45].map((duration) => (
                              <TouchableOpacity
                                key={duration}
                                style={styles.durationButton}
                                activeOpacity={0.8}
                              >
                                <Text style={styles.durationButtonText}>{duration} min</Text>
                              </TouchableOpacity>
                            ))}
                          </View>
                        </View>
                      </View>

                      {/* Water Tank Level */}
                      <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                          <Waves size={20} color="#3B82F6" strokeWidth={2} /> Water Tank
                          Level
                        </Text>

                        <View style={styles.tankContainer}>
                          {/* Vertical Tank Visualization */}
                          <View style={styles.tank}>
                            {/* Water level */}
                            <Animated.View style={[styles.waterLevel, animatedTankLevel]}>
                              {/* Animated waves */}
                              <Animated.View style={[styles.waves, animatedWave]} />
                            </Animated.View>

                            {/* Level markers */}
                            {[25, 50, 75].map((level) => (
                              <View
                                key={level}
                                style={[styles.levelMarker, { bottom: `${level}%` }]}
                              />
                            ))}
                          </View>

                          {/* Info */}
                          <View style={styles.tankInfo}>
                            <Text style={styles.tankLevelText}>{tankLevel}%</Text>
                            <Text style={styles.tankLabel}>Current Level</Text>

                            {/* Stats */}
                            <View style={styles.tankStats}>
                              <View style={styles.tankStat}>
                                <Text style={styles.tankStatLabel}>Capacity:</Text>
                                <Text style={styles.tankStatValue}>1000L</Text>
                              </View>
                              <View style={styles.tankStat}>
                                <Text style={styles.tankStatLabel}>Available:</Text>
                                <Text style={styles.tankStatValue}>{tankLevel * 10}L</Text>
                              </View>
                              <View style={styles.tankStat}>
                                <Text style={styles.tankStatLabel}>Usage Today:</Text>
                                <Text style={styles.tankStatValue}>125L</Text>
                              </View>
                            </View>

                            {/* Refill button */}
                            <TouchableOpacity
                              style={[
                                styles.refillButton,
                                tankLevel >= 95 && styles.refillButtonDisabled,
                              ]}
                              onPress={() => setTankLevel(100)}
                              disabled={tankLevel >= 95}
                              activeOpacity={0.8}
                            >
                              <Text style={styles.refillButtonText}>💧 Start Refill</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      </View>

                      {/* Quick Stats */}
                      <View style={styles.statsRow}>
                        <View style={styles.statBox}>
                          <Text style={styles.statLabel}>Soil Moisture</Text>
                          <Text style={styles.statValue}>65%</Text>
                        </View>
                        <View style={styles.statBox}>
                          <Text style={styles.statLabel}>Weather</Text>
                          <Text style={styles.statValue}>☀️ 28°C</Text>
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
  zoneMap: {
    aspectRatio: 1,
    borderRadius: 16,
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.1)',
    padding: 24,
    marginBottom: 16,
  },
  house: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: [{ translateX: -64 }, { translateY: -64 }],
    width: 128,
    height: 128,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  houseEmoji: {
    fontSize: 64,
  },
  zoneButton: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  zoneButtonActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.3)',
    borderColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 30,
    elevation: 10,
  },
  zoneEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  zoneLabel: {
    fontSize: 12,
    color: '#FFFFFF',
  },
  zonePulse: {
    position: 'absolute',
    inset: 0,
    borderRadius: 40,
    borderWidth: 2,
    borderColor: '#00E5FF',
  },
  zoneStatus: {
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    marginBottom: 16,
  },
  zoneStatusLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 8,
  },
  zoneStatusValue: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.4)',
  },
  activeZonesContainer: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  activeZoneBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: 'rgba(0, 229, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.3)',
  },
  activeZoneText: {
    fontSize: 14,
    color: '#00E5FF',
    fontWeight: '600',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  allOnButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'linear-gradient(90deg, #22C55E, #00E5FF)',
    alignItems: 'center',
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  allOnButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  allOffButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  allOffButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  scheduleContainer: {
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  scheduleLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  timeSliderContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  timeLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  timeValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#00E5FF',
  },
  durationRow: {
    flexDirection: 'row',
    gap: 8,
  },
  durationButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    alignItems: 'center',
  },
  durationButtonText: {
    fontSize: 14,
    color: '#FFFFFF',
  },
  tankContainer: {
    flexDirection: 'row',
    gap: 24,
    padding: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  tank: {
    width: 80,
    height: 192,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  waterLevel: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'linear-gradient(180deg, #3B82F6, #00E5FF)',
  },
  waves: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  levelMarker: {
    position: 'absolute',
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  tankInfo: {
    flex: 1,
  },
  tankLevelText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  tankLabel: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.6)',
    marginBottom: 16,
  },
  tankStats: {
    gap: 8,
    marginBottom: 16,
  },
  tankStat: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  tankStatLabel: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.6)',
  },
  tankStatValue: {
    fontSize: 14,
    color: '#00E5FF',
    fontWeight: '600',
  },
  refillButton: {
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: 'linear-gradient(90deg, #3B82F6, #00E5FF)',
    alignItems: 'center',
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  refillButtonDisabled: {
    opacity: 0.5,
  },
  refillButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statBox: {
    flex: 1,
    padding: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
});
