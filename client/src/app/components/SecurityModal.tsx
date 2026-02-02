import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, DoorClosed, DoorOpen, AlertTriangle, Camera, Clock } from "lucide-react";

interface SecurityModalProps {
  onClose: () => void;
}

type GarageState = "closed" | "opening" | "open" | "obstacle";

export function SecurityModal({ onClose }: SecurityModalProps) {
  const [garageState, setGarageState] = useState<GarageState>("closed");
  const [logEntries] = useState([
    { time: "10:00 AM", event: "Front Door Opened", type: "info" },
    { time: "09:45 AM", event: "Garage Door Closed", type: "info" },
    { time: "09:30 AM", event: "Motion Detected - Driveway", type: "warning" },
    { time: "08:15 AM", event: "System Armed", type: "success" },
  ]);

  const handleGarageDoor = () => {
    if (garageState === "closed") {
      setGarageState("opening");
      
      // Simulate opening sequence with potential obstacle
      setTimeout(() => {
        // Random chance of obstacle (for demo)
        if (Math.random() > 0.7) {
          setGarageState("obstacle");
          setTimeout(() => setGarageState("closed"), 3000);
        } else {
          setGarageState("open");
        }
      }, 2000);
    } else if (garageState === "open") {
      setGarageState("closed");
    } else if (garageState === "obstacle") {
      setGarageState("closed");
    }
  };

  const getGarageButtonColor = () => {
    switch (garageState) {
      case "closed":
        return "bg-green-500/20 border-green-500 hover:bg-green-500/30 shadow-[0_0_20px_rgba(34,197,94,0.4)] hover:shadow-[0_0_30px_rgba(34,197,94,0.6)] active:shadow-[0_0_40px_rgba(34,197,94,0.8)]";
      case "opening":
        return "bg-yellow-500/20 border-yellow-500 shadow-[0_0_20px_rgba(234,179,8,0.4)]";
      case "open":
        return "bg-blue-500/20 border-blue-500 hover:bg-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:shadow-[0_0_30px_rgba(59,130,246,0.6)] active:shadow-[0_0_40px_rgba(59,130,246,0.8)]";
      case "obstacle":
        return "bg-red-500/20 border-red-500 shadow-[0_0_20px_rgba(239,68,68,0.4)] animate-pulse";
    }
  };

  const getGarageButtonText = () => {
    switch (garageState) {
      case "closed":
        return "🚪 Open Garage";
      case "opening":
        return "⏳ Opening...";
      case "open":
        return "🚪 Close Garage";
      case "obstacle":
        return "⚠️ Obstacle Detected!";
    }
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
        className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 w-full max-w-4xl relative overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-transparent to-transparent pointer-events-none" />

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
          <h2 className="text-3xl mb-2">Security & Access</h2>
          <p className="text-white/60">Monitor and control entry points</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-6">
            {/* Garage Door Control */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl mb-4 flex items-center gap-2">
                {garageState === "closed" ? (
                  <DoorClosed className="w-5 h-5 text-green-400" />
                ) : garageState === "obstacle" ? (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                ) : (
                  <DoorOpen className="w-5 h-5 text-blue-400" />
                )}
                Garage Door
              </h3>

              {/* Visual Status */}
              <div className="mb-4 relative h-32 rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                <AnimatePresence mode="wait">
                  {garageState === "closed" && (
                    <motion.div
                      key="closed"
                      initial={{ y: -100 }}
                      animate={{ y: 0 }}
                      exit={{ y: -100 }}
                      className="absolute inset-0 bg-gradient-to-b from-green-500/20 to-green-500/5 flex items-center justify-center"
                    >
                      <DoorClosed className="w-16 h-16 text-green-400" />
                    </motion.div>
                  )}
                  {garageState === "opening" && (
                    <motion.div
                      key="opening"
                      initial={{ y: 0 }}
                      animate={{ y: -50 }}
                      className="absolute inset-0 bg-gradient-to-b from-yellow-500/20 to-yellow-500/5 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                      >
                        ⏳
                      </motion.div>
                    </motion.div>
                  )}
                  {garageState === "open" && (
                    <motion.div
                      key="open"
                      initial={{ y: 0 }}
                      animate={{ y: 0 }}
                      className="absolute inset-0 bg-gradient-to-b from-blue-500/20 to-blue-500/5 flex items-center justify-center"
                    >
                      <DoorOpen className="w-16 h-16 text-blue-400" />
                    </motion.div>
                  )}
                  {garageState === "obstacle" && (
                    <motion.div
                      key="obstacle"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute inset-0 bg-gradient-to-b from-red-500/20 to-red-500/5 flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 0.5, repeat: Infinity }}
                      >
                        <AlertTriangle className="w-16 h-16 text-red-400" />
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Control Button */}
              <motion.button
                whileHover={{ scale: garageState === "opening" ? 1 : 1.02 }}
                whileTap={{ scale: garageState === "opening" ? 1 : 0.98 }}
                onClick={handleGarageDoor}
                disabled={garageState === "opening"}
                className={`w-full py-4 rounded-xl border-2 transition-all ${getGarageButtonColor()} disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {getGarageButtonText()}
              </motion.button>

              {/* Status Text */}
              <p className="text-center text-white/60 text-sm mt-3">
                {garageState === "obstacle" && "⚠️ Obstacle detected - Door reversed"}
                {garageState === "opening" && "System responding..."}
                {garageState === "closed" && "Door is secured"}
                {garageState === "open" && "Door is open"}
              </p>
            </div>

            {/* Additional Controls */}
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
              >
                <DoorClosed className="w-6 h-6 mb-2 mx-auto text-[#00E5FF]" />
                <p className="text-sm">Front Door</p>
                <p className="text-xs text-white/60">Locked</p>
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_15px_rgba(0,229,255,0.5)]"
              >
                <DoorClosed className="w-6 h-6 mb-2 mx-auto text-[#00E5FF]" />
                <p className="text-sm">Back Door</p>
                <p className="text-xs text-white/60">Locked</p>
              </motion.button>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-6">
            {/* Live Camera Feed */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-[#00E5FF]" />
                Live Camera Feed
              </h3>

              {/* Camera placeholder */}
              <div className="aspect-video rounded-xl bg-white/5 border border-white/10 overflow-hidden relative mb-3">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <Camera className="w-12 h-12 mx-auto mb-2 text-[#00E5FF]" />
                    <p className="text-white/60">Driveway Camera</p>
                    <motion.div
                      animate={{ opacity: [1, 0.5, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                      className="mt-2 w-2 h-2 rounded-full bg-red-500 mx-auto"
                    />
                    <p className="text-xs text-red-400 mt-1">● LIVE</p>
                  </div>
                </div>

                {/* Simulated camera grid overlay */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                  {Array.from({ length: 9 }).map((_, i) => (
                    <div key={i} className="border border-white/5" />
                  ))}
                </div>
              </div>

              {/* Camera controls */}
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 text-sm transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                >
                  📸 Snapshot
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex-1 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 text-sm transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_10px_rgba(0,229,255,0.5)]"
                >
                  🎥 Record
                </motion.button>
              </div>
            </div>

            {/* Activity Log */}
            <div className="p-6 rounded-2xl bg-white/5 border border-white/10">
              <h3 className="text-xl mb-4 flex items-center gap-2">
                <Clock className="w-5 h-5 text-[#00E5FF]" />
                Activity Log
              </h3>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {logEntries.map((entry, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <p className="text-sm">{entry.event}</p>
                        <p className="text-xs text-white/60 mt-1">{entry.time}</p>
                      </div>
                      <div
                        className={`w-2 h-2 rounded-full mt-1 ${
                          entry.type === "success"
                            ? "bg-green-400"
                            : entry.type === "warning"
                            ? "bg-yellow-400"
                            : "bg-blue-400"
                        }`}
                      />
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
