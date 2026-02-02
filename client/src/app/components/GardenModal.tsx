import { useState } from "react";
import { motion } from "motion/react";
import { X, Droplets, Clock, Waves } from "lucide-react";

interface GardenModalProps {
  onClose: () => void;
}

export function GardenModal({ onClose }: GardenModalProps) {
  const [activeZones, setActiveZones] = useState<number[]>([]);
  const [wateringTime, setWateringTime] = useState(18);
  const [tankLevel, setTankLevel] = useState(75);

  const toggleZone = (zone: number) => {
    setActiveZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone]
    );
  };

  const isZoneActive = (zone: number) => activeZones.includes(zone);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 w-full max-w-4xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-transparent to-blue-500/10 pointer-events-none" />

        {/* Close button */}
        <motion.button
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
          onClick={onClose}
          className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center border border-white/10 z-10 transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
        >
          <X className="w-5 h-5" />
        </motion.button>

        {/* Header */}
        <div className="mb-8">
          <h2 className="text-3xl mb-2">Garden & Utilities</h2>
          <p className="text-white/60">Manage irrigation and water systems</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Zone Map */}
          <div className="space-y-6">
            <div>
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <Droplets className="w-5 h-5 text-green-400" />
                Irrigation Zones
              </h3>

              {/* House/Garden Map */}
              <div className="relative aspect-square rounded-2xl bg-gradient-to-br from-green-500/10 to-blue-500/10 border border-white/10 p-6">
                {/* House representation */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center">
                  <span className="text-2xl">🏠</span>
                </div>

                {/* Zone 1 - Front Yard */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleZone(1)}
                  className={`absolute top-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    isZoneActive(1)
                      ? "bg-[#00E5FF]/30 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.6)]"
                      : "bg-white/5 border-white/20 hover:border-[#00E5FF]/50 active:bg-[#00E5FF]/20 active:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  }`}
                >
                  <span className="text-2xl mb-1">💧</span>
                  <span className="text-xs">Zone 1</span>
                  {isZoneActive(1) && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#00E5FF]"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                      }}
                    />
                  )}
                </motion.button>

                {/* Zone 2 - Back Yard */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleZone(2)}
                  className={`absolute bottom-4 left-1/2 -translate-x-1/2 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    isZoneActive(2)
                      ? "bg-[#00E5FF]/30 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.6)]"
                      : "bg-white/5 border-white/20 hover:border-[#00E5FF]/50 active:bg-[#00E5FF]/20 active:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  }`}
                >
                  <span className="text-2xl mb-1">🌿</span>
                  <span className="text-xs">Zone 2</span>
                  {isZoneActive(2) && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#00E5FF]"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.3,
                      }}
                    />
                  )}
                </motion.button>

                {/* Zone 3 - Side Garden */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => toggleZone(3)}
                  className={`absolute top-1/2 right-4 -translate-y-1/2 w-20 h-20 rounded-full border-2 flex flex-col items-center justify-center transition-all ${
                    isZoneActive(3)
                      ? "bg-[#00E5FF]/30 border-[#00E5FF] shadow-[0_0_30px_rgba(0,229,255,0.6)]"
                      : "bg-white/5 border-white/20 hover:border-[#00E5FF]/50 active:bg-[#00E5FF]/20 active:shadow-[0_0_15px_rgba(0,229,255,0.4)]"
                  }`}
                >
                  <span className="text-2xl mb-1">🌱</span>
                  <span className="text-xs">Zone 3</span>
                  {isZoneActive(3) && (
                    <motion.div
                      className="absolute inset-0 rounded-full border-2 border-[#00E5FF]"
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.6, 0, 0.6],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        delay: 0.6,
                      }}
                    />
                  )}
                </motion.button>
              </div>

              {/* Zone Status */}
              <div className="mt-4 p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-2">Active Zones:</p>
                {activeZones.length === 0 ? (
                  <p className="text-white/40">No zones active</p>
                ) : (
                  <div className="flex gap-2">
                    {activeZones.map((zone) => (
                      <span
                        key={zone}
                        className="px-3 py-1 rounded-lg bg-[#00E5FF]/20 text-[#00E5FF] text-sm border border-[#00E5FF]/30"
                      >
                        Zone {zone}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Control Buttons */}
              <div className="grid grid-cols-2 gap-3 mt-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveZones([1, 2, 3])}
                  className="py-3 rounded-xl bg-gradient-to-r from-green-500 to-[#00E5FF] hover:from-green-400 hover:to-[#00D5EF] shadow-lg hover:shadow-[0_0_20px_rgba(34,197,94,0.5)] transition-all active:shadow-[0_0_30px_rgba(34,197,94,0.7)]"
                >
                  💧 All On
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveZones([])}
                  className="py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 transition-all active:bg-red-500/20 active:shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                >
                  🛑 All Off
                </motion.button>
              </div>
            </div>
          </div>

          {/* Right: Settings */}
          <div className="space-y-6">
            {/* Watering Schedule */}
            <div>
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00E5FF]" />
                Watering Schedule
              </h3>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <label className="block text-sm text-white/60 mb-3">
                  Next Watering Time
                </label>

                {/* Time Slider */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/60">06:00</span>
                    <span className="text-[#00E5FF] text-xl">
                      {wateringTime.toString().padStart(2, "0")}:00
                    </span>
                    <span className="text-white/60">22:00</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="22"
                    value={wateringTime}
                    onChange={(e) => setWateringTime(parseInt(e.target.value))}
                    className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#00E5FF]"
                    style={{
                      background: `linear-gradient(to right, #00E5FF 0%, #00E5FF ${
                        ((wateringTime - 6) / 16) * 100
                      }%, rgba(255,255,255,0.1) ${
                        ((wateringTime - 6) / 16) * 100
                      }%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                </div>

                {/* Duration */}
                <div className="grid grid-cols-3 gap-2">
                  {[15, 30, 45].map((duration) => (
                    <motion.button
                      key={duration}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 text-sm transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                    >
                      {duration} min
                    </motion.button>
                  ))}
                </div>
              </div>
            </div>

            {/* Water Tank Level */}
            <div>
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <Waves className="w-5 h-5 text-blue-400" />
                Water Tank Level
              </h3>

              <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
                <div className="flex gap-6 items-center">
                  {/* Vertical Tank Visualization */}
                  <div className="relative w-20 h-48 rounded-xl bg-white/5 border-2 border-white/20 overflow-hidden">
                    {/* Water level */}
                    <motion.div
                      className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-blue-500 to-[#00E5FF]"
                      initial={{ height: 0 }}
                      animate={{ height: `${tankLevel}%` }}
                      transition={{ duration: 1 }}
                    >
                      {/* Animated waves */}
                      <motion.div
                        className="absolute top-0 left-0 right-0 h-4 bg-gradient-to-b from-white/20 to-transparent"
                        animate={{
                          y: [-4, 4, -4],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      />
                    </motion.div>

                    {/* Level markers */}
                    {[25, 50, 75].map((level) => (
                      <div
                        key={level}
                        className="absolute left-0 right-0 border-t border-white/20"
                        style={{ bottom: `${level}%` }}
                      />
                    ))}
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="text-5xl mb-2">{tankLevel}%</div>
                    <p className="text-white/60 mb-4">Current Level</p>

                    {/* Stats */}
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/60">Capacity:</span>
                        <span>1000L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Available:</span>
                        <span className="text-[#00E5FF]">{tankLevel * 10}L</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/60">Usage Today:</span>
                        <span>125L</span>
                      </div>
                    </div>

                    {/* Refill button */}
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setTankLevel(100)}
                      disabled={tankLevel >= 95}
                      className="w-full mt-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-[#00E5FF] hover:from-blue-400 hover:to-[#00D5EF] disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-[0_0_20px_rgba(0,229,255,0.5)] transition-all active:shadow-[0_0_30px_rgba(0,229,255,0.7)]"
                    >
                      💧 Start Refill
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-1">Soil Moisture</p>
                <p className="text-2xl text-green-400">65%</p>
              </div>
              <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                <p className="text-sm text-white/60 mb-1">Weather</p>
                <p className="text-2xl">☀️ 28°C</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
