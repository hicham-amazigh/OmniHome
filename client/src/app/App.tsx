import { useState } from "react";
import { AuthenticationScreen } from "@/app/components/AuthenticationScreen";
import { MainDashboard } from "@/app/components/MainDashboard";
import { ClimateModal } from "@/app/components/ClimateModal";
import { SecurityModal } from "@/app/components/SecurityModal";
import { GardenModal } from "@/app/components/GardenModal";

type ModalType = "climate" | "security" | "garden" | null;

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  return (
    <div className="min-h-screen bg-[#121212] text-white font-sans relative overflow-hidden">
      {/* Cyberpunk background effects */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#121212] via-[#1a1a2e] to-[#121212] pointer-events-none" />
      <div className="fixed inset-0 opacity-30 pointer-events-none" 
           style={{
             backgroundImage: 'radial-gradient(circle at 20% 50%, rgba(0, 229, 255, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(0, 229, 255, 0.1) 0%, transparent 50%)'
           }} />
      
      {!isAuthenticated ? (
        <AuthenticationScreen onAuthenticate={() => setIsAuthenticated(true)} />
      ) : (
        <>
          <MainDashboard onOpenModal={setActiveModal} />
          
          {activeModal === "climate" && (
            <ClimateModal onClose={() => setActiveModal(null)} />
          )}
          
          {activeModal === "security" && (
            <SecurityModal onClose={() => setActiveModal(null)} />
          )}
          
          {activeModal === "garden" && (
            <GardenModal onClose={() => setActiveModal(null)} />
          )}
        </>
      )}
    </div>
  );
}
