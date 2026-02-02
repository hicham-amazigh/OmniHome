import { useState, useRef } from "react";
import { motion } from "motion/react";
import { X, Wind, Zap } from "lucide-react";

interface ClimateModalProps {
  onClose: () => void;
}

export function ClimateModal({ onClose }: ClimateModalProps) {
  const [temperature, setTemperature] = useState(22);
  const [isDragging, setIsDragging] = useState(false);
  const [fanSpeed, setFanSpeed] = useState<"low" | "med" | "high">("med");
  const [mode, setMode] = useState<"cool" | "heat" | "eco">("cool");
  const dialRef = useRef<HTMLDivElement>(null);

  const handleDialDrag = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return;
    
    const dial = dialRef.current;
    if (!dial) return;

    const rect = dial.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const angle = Math.atan2(event.clientY - centerY, event.clientX - centerX);
    const degrees = (angle * 180) / Math.PI + 90;
    const normalizedDegrees = (degrees + 360) % 360;
    
    // Map 0-360 degrees to 16-30°C
    const temp = Math.round(16 + (normalizedDegrees / 360) * 14);
    setTemperature(Math.max(16, Math.min(30, temp)));
  };

  const getRotationAngle = () => {
    // Map 16-30°C to 0-360 degrees
    return ((temperature - 16) / 14) * 360;
  };

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
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 w-full max-w-2xl relative overflow-hidden"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent pointer-events-none" />

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
          <h2 className="text-3xl mb-2">Climate Control</h2>
          <p className="text-white/60">Adjust temperature and settings</p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left: Circular Dial */}
          <div className="flex items-center justify-center">
            <div className="relative">
              {/* Outer ring with gradient */}
              <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500/20 to-orange-500/20 blur-xl" />
              
              {/* Dial container */}
              <div
                ref={dialRef}
                onMouseDown={() => setIsDragging(true)}
                onMouseUp={() => setIsDragging(false)}
                onMouseLeave={() => setIsDragging(false)}
                onMouseMove={handleDialDrag}
                className="relative w-64 h-64 rounded-full bg-white/5 border-4 border-white/10 cursor-grab active:cursor-grabbing"
                style={{
                  boxShadow: isDragging ? "0 0 40px rgba(0, 229, 255, 0.6)" : "0 0 20px rgba(0, 229, 255, 0.2)"
                }}
              >
                {/* Temperature marks */}
                {[16, 18, 20, 22, 24, 26, 28, 30].map((temp) => {
                  const angle = ((temp - 16) / 14) * 360 - 90;
                  const rad = (angle * Math.PI) / 180;
                  const x = Math.cos(rad) * 110;
                  const y = Math.sin(rad) * 110;
                  
                  return (
                    <div
                      key={temp}
                      className="absolute text-xs text-white/40"
                      style={{
                        left: `calc(50% + ${x}px)`,
                        top: `calc(50% + ${y}px)`,
                        transform: "translate(-50%, -50%)",
                      }}
                    >
                      {temp}°
                    </div>
                  );
                })}

                {/* Center display */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <motion.div
                    animate={{
                      scale: isDragging ? [1, 1.05, 1] : 1,
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-6xl mb-2"
                  >
                    {temperature}°
                  </motion.div>
                  <p className="text-white/60">Target Temp</p>
                </div>

                {/* Draggable handle */}
                <motion.div
                  className="absolute w-6 h-6 rounded-full bg-[#00E5FF] shadow-lg cursor-grab active:cursor-grabbing"
                  style={{
                    top: "50%",
                    left: "50%",
                    transform: `translate(-50%, -50%) rotate(${getRotationAngle()}deg) translateY(-110px)`,
                    boxShadow: isDragging 
                      ? "0 0 30px rgba(0, 229, 255, 0.8)" 
                      : "0 0 15px rgba(0, 229, 255, 0.6)"
                  }}
                  animate={{
                    scale: isDragging ? 1.3 : 1,
                  }}
                >
                  {/* Handle indicator */}
                  <div className="absolute inset-0 rounded-full border-2 border-white/30" />
                </motion.div>

                {/* Visual feedback ring */}
                <motion.div
                  className="absolute inset-0 rounded-full border-4"
                  style={{
                    borderColor: temperature < 20 ? "#3B82F6" : temperature > 24 ? "#F97316" : "#00E5FF",
                    opacity: 0.3,
                  }}
                  animate={{
                    rotate: getRotationAngle(),
                  }}
                />
              </div>
            </div>
          </div>

          {/* Right: Controls */}
          <div className="space-y-6">
            {/* Fan Speed */}
            <div>
              <label className="block text-sm text-white/60 mb-3">
                <Wind className="inline w-4 h-4 mr-2" />
                Fan Speed
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["low", "med", "high"] as const).map((speed) => (
                  <motion.button
                    key={speed}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setFanSpeed(speed)}
                    className={`py-3 rounded-xl transition-all ${
                      fanSpeed === speed
                        ? "bg-[#00E5FF]/20 border-2 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.4)]"
                        : "bg-white/5 border-2 border-white/10 hover:border-white/20 active:bg-[#00E5FF]/10 active:shadow-[0_0_10px_rgba(0,229,255,0.3)]"
                    }`}
                  >
                    {speed === "low" && "🌬️ Low"}
                    {speed === "med" && "💨 Med"}
                    {speed === "high" && "🌪️ High"}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Mode */}
            <div>
              <label className="block text-sm text-white/60 mb-3">
                <Zap className="inline w-4 h-4 mr-2" />
                Mode
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(["cool", "heat", "eco"] as const).map((m) => (
                  <motion.button
                    key={m}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setMode(m)}
                    className={`py-3 rounded-xl transition-all ${
                      mode === m
                        ? m === "cool"
                          ? "bg-blue-500/20 border-2 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.4)]"
                          : m === "heat"
                          ? "bg-orange-500/20 border-2 border-orange-500 shadow-[0_0_20px_rgba(249,115,22,0.4)]"
                          : "bg-green-500/20 border-2 border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.4)]"
                        : "bg-white/5 border-2 border-white/10 hover:border-white/20 active:bg-white/10 active:shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    }`}
                  >
                    {m === "cool" && "❄️ Cool"}
                    {m === "heat" && "🔥 Heat"}
                    {m === "eco" && "🌿 Eco"}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Status Info */}
            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Current Temp:</span>
                <span className="text-[#00E5FF]">21°C</span>
              </div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-white/60">Humidity:</span>
                <span>45%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/60">Power Usage:</span>
                <span>1.2 kW</span>
              </div>
            </div>

            {/* Apply Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#0077FF] hover:from-[#00D5EF] hover:to-[#0067EF] shadow-lg hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all active:shadow-[0_0_40px_rgba(0,229,255,0.8)]"
            >
              Apply Settings
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
