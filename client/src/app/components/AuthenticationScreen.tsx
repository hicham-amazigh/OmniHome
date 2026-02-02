import { useState } from "react";
import { motion } from "motion/react";
import { Fingerprint, Eye } from "lucide-react";

interface AuthenticationScreenProps {
  onAuthenticate: () => void;
}

export function AuthenticationScreen({ onAuthenticate }: AuthenticationScreenProps) {
  const [pin, setPin] = useState("");
  const [status, setStatus] = useState<"locked" | "scanning" | "error">("locked");
  const [isScanning, setIsScanning] = useState(false);

  const handleNumberClick = (num: string) => {
    if (pin.length < 4) {
      const newPin = pin + num;
      setPin(newPin);
      
      // Auto-authenticate when 4 digits entered (demo purposes)
      if (newPin.length === 4) {
        setTimeout(() => {
          onAuthenticate();
        }, 500);
      }
    }
  };

  const handleClear = () => {
    setPin("");
    setStatus("locked");
  };

  const handleBiometric = () => {
    setIsScanning(true);
    setStatus("scanning");
    
    // Simulate biometric scan
    setTimeout(() => {
      onAuthenticate();
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 relative z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Glassmorphism card */}
        <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#0077FF] flex items-center justify-center"
            >
              <Eye className="w-10 h-10 text-white" />
            </motion.div>
            <h1 className="text-3xl mb-2">OmniHome</h1>
            <p className="text-[#00E5FF]">Central Control System</p>
          </div>

          {/* Status indicator */}
          <div className="text-center mb-6">
            <motion.div
              animate={{
                opacity: isScanning ? [1, 0.5, 1] : 1,
              }}
              transition={{
                duration: 1.5,
                repeat: isScanning ? Infinity : 0,
              }}
              className={`inline-block px-6 py-2 rounded-full ${
                status === "locked"
                  ? "bg-red-500/20 text-red-400"
                  : status === "scanning"
                  ? "bg-[#00E5FF]/20 text-[#00E5FF]"
                  : "bg-red-500/20 text-red-400"
              }`}
            >
              {status === "locked" && "🔒 System Locked"}
              {status === "scanning" && "🔍 Scanning..."}
              {status === "error" && "❌ Access Denied"}
            </motion.div>
          </div>

          {/* PIN Display */}
          <div className="flex justify-center gap-3 mb-8">
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                animate={{
                  scale: pin.length > i ? [1, 1.2, 1] : 1,
                }}
                className={`w-14 h-14 rounded-xl flex items-center justify-center border-2 ${
                  pin.length > i
                    ? "bg-[#00E5FF]/20 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.5)]"
                    : "bg-white/5 border-white/20"
                }`}
              >
                {pin.length > i && (
                  <div className="w-3 h-3 rounded-full bg-[#00E5FF]" />
                )}
              </motion.div>
            ))}
          </div>

          {/* Numeric Keypad */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <motion.button
                key={num}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleNumberClick(num.toString())}
                className="h-16 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
              >
                <span className="text-2xl">{num}</span>
              </motion.button>
            ))}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClear}
              className="h-16 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-red-500/50 transition-all"
            >
              <span className="text-xl">CLR</span>
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleNumberClick("0")}
              className="h-16 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#00E5FF]/50 transition-all active:bg-[#00E5FF]/20 active:shadow-[0_0_20px_rgba(0,229,255,0.5)]"
            >
              <span className="text-2xl">0</span>
            </motion.button>
            
            <div className="h-16" /> {/* Empty space */}
          </div>

          {/* Biometric Scan Button */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleBiometric}
            disabled={isScanning}
            className="w-full h-16 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#0077FF] hover:from-[#00D5EF] hover:to-[#0067EF] flex items-center justify-center gap-3 shadow-lg hover:shadow-[0_0_30px_rgba(0,229,255,0.5)] transition-all disabled:opacity-50 active:shadow-[0_0_40px_rgba(0,229,255,0.8)]"
          >
            <motion.div
              animate={{
                rotate: isScanning ? 360 : 0,
              }}
              transition={{
                duration: 2,
                repeat: isScanning ? Infinity : 0,
                ease: "linear",
              }}
            >
              <Fingerprint className="w-6 h-6" />
            </motion.div>
            <span className="text-lg">Biometric Scan</span>
          </motion.button>

          {/* Hint text */}
          <p className="text-center text-white/40 text-sm mt-4">
            Enter any 4-digit PIN or use biometric scan
          </p>
        </div>
      </motion.div>
    </div>
  );
}
