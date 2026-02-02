import { useState } from "react";
import { motion } from "motion/react";
import { 
  Shield, 
  ShieldAlert, 
  Thermometer, 
  Droplets, 
  Lightbulb, 
  LightbulbOff,
  ChevronRight,
  Clock
} from "lucide-react";

interface MainDashboardProps {
  onOpenModal: (modal: "climate" | "security" | "garden") => void;
}

export function MainDashboard({ onOpenModal }: MainDashboardProps) {
  const [securityArmed, setSecurityArmed] = useState(true);
  const [lightsOn, setLightsOn] = useState(true);
  const [temperature, setTemperature] = useState(22);

  return (
    <div className="min-h-screen p-6 md:p-8 relative z-10">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-4xl mb-2">Welcome Home</h1>
        <p className="text-white/60">Monday, February 2, 2026 · 14:30</p>
      </motion.div>

      {/* Widget Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl">
        {/* Security Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          onClick={() => onOpenModal("security")}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#00E5FF]/50 transition-all cursor-pointer group relative overflow-hidden"
        >
          {/* Glow effect on hover */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/0 to-[#00E5FF]/0 group-hover:from-[#00E5FF]/5 group-hover:to-transparent transition-all" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                {securityArmed ? (
                  <div className="w-12 h-12 rounded-xl bg-red-500/20 flex items-center justify-center">
                    <ShieldAlert className="w-6 h-6 text-red-400" />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                    <Shield className="w-6 h-6 text-green-400" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl mb-1">Security System</h3>
                  <p className="text-white/60 text-sm">Home Protection</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-[#00E5FF] transition-colors" />
            </div>

            {/* Status */}
            <div className="flex items-center justify-between mb-4">
              <span className="text-white/60">Status:</span>
              <motion.span
                animate={{
                  opacity: securityArmed ? [1, 0.6, 1] : 1,
                }}
                transition={{
                  duration: 2,
                  repeat: securityArmed ? Infinity : 0,
                }}
                className={`px-3 py-1 rounded-lg ${
                  securityArmed
                    ? "bg-red-500/20 text-red-400"
                    : "bg-green-500/20 text-green-400"
                }`}
              >
                {securityArmed ? "Armed" : "Disarmed"}
              </motion.span>
            </div>

            {/* Panic Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={(e) => {
                e.stopPropagation();
                alert("PANIC ALERT TRIGGERED!");
              }}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-[#FF2E2E] to-[#D41F1F] hover:from-[#FF4E4E] hover:to-[#E43F3F] shadow-lg hover:shadow-[0_0_20px_rgba(255,46,46,0.5)] transition-all active:shadow-[0_0_30px_rgba(255,46,46,0.8)]"
            >
              🚨 Panic Alert
            </motion.button>
          </div>
        </motion.div>

        {/* Climate Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          onClick={() => onOpenModal("climate")}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#00E5FF]/50 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/0 to-[#00E5FF]/0 group-hover:from-[#00E5FF]/5 group-hover:to-transparent transition-all" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500/20 flex items-center justify-center">
                  <Thermometer className="w-6 h-6 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-xl mb-1">Climate Control</h3>
                  <p className="text-white/60 text-sm">Temperature & AC</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-[#00E5FF] transition-colors" />
            </div>

            {/* Temperature Display */}
            <div className="text-center my-6">
              <div className="text-5xl mb-2">{temperature}°C</div>
              <p className="text-white/60">Current Temperature</p>
            </div>

            {/* Quick Toggle */}
            <div className="flex gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTemperature(temp => Math.max(16, temp - 1));
                }}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
              >
                ❄️ Cool
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setTemperature(temp => Math.min(30, temp + 1));
                }}
                className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-orange-500/50 transition-all active:bg-orange-500/20 active:shadow-[0_0_15px_rgba(255,165,0,0.5)]"
              >
                🔥 Heat
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Garden Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          onClick={() => onOpenModal("garden")}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-[#00E5FF]/50 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-[#00E5FF]/0 to-[#00E5FF]/0 group-hover:from-[#00E5FF]/5 group-hover:to-transparent transition-all" />
          
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                  <Droplets className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-xl mb-1">Garden & Utilities</h3>
                  <p className="text-white/60 text-sm">Irrigation System</p>
                </div>
              </div>
              <ChevronRight className="w-6 h-6 text-white/40 group-hover:text-[#00E5FF] transition-colors" />
            </div>

            {/* Next watering */}
            <div className="flex items-center gap-3 mb-4 p-3 rounded-xl bg-white/5">
              <Clock className="w-5 h-5 text-[#00E5FF]" />
              <div>
                <p className="text-sm text-white/60">Next Watering</p>
                <p className="text-lg">18:00 Today</p>
              </div>
            </div>

            {/* Moisture Level */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-white/60">Soil Moisture</span>
                <span className="text-[#00E5FF]">65%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "65%" }}
                  transition={{ duration: 1, delay: 0.5 }}
                  className="h-full bg-gradient-to-r from-green-400 to-[#00E5FF]"
                />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Lighting Widget */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 relative overflow-hidden"
        >
          <div className="relative">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${
                  lightsOn 
                    ? "bg-yellow-500/20 shadow-[0_0_20px_rgba(255,220,0,0.3)]" 
                    : "bg-white/5"
                }`}>
                  {lightsOn ? (
                    <Lightbulb className="w-6 h-6 text-yellow-400" />
                  ) : (
                    <LightbulbOff className="w-6 h-6 text-white/40" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl mb-1">Lighting Control</h3>
                  <p className="text-white/60 text-sm">All Rooms</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-sm text-white/60 mb-1">Active Lights</p>
                <p className="text-2xl">{lightsOn ? "12" : "0"}</p>
              </div>
              <div className="p-3 rounded-xl bg-white/5">
                <p className="text-sm text-white/60 mb-1">Energy</p>
                <p className="text-2xl">{lightsOn ? "240W" : "0W"}</p>
              </div>
            </div>

            {/* Master Switch */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setLightsOn(!lightsOn)}
              className={`w-full py-3 rounded-xl transition-all ${
                lightsOn
                  ? "bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-400 hover:to-orange-400 shadow-[0_0_20px_rgba(255,220,0,0.4)] hover:shadow-[0_0_30px_rgba(255,220,0,0.6)] active:shadow-[0_0_40px_rgba(255,220,0,0.8)]"
                  : "bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 active:bg-[#00E5FF]/20 active:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
              }`}
            >
              {lightsOn ? "💡 Turn All Off" : "🔦 Turn All On"}
            </motion.button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
