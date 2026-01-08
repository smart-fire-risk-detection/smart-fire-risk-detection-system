import { ThingSpeakData } from "@/components/dashboard/ThingSpeakData";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import dashboardBackground from "@/assets/50e8bca4-e0da-4a24-a317-393aa4e58a1b.png";

export default function ThingSpeakDataPage() {
  const { user } = useAuth();
  
  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return (
    <div 
      className="min-h-screen bg-background p-2 sm:p-4 md:p-6 relative overflow-x-hidden"
      style={{
        backgroundImage: `url(${dashboardBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: window.innerWidth > 768 ? 'fixed' : 'scroll'
      }}
    >
      <div className="max-w-7xl mx-auto space-y-4 sm:space-y-6 md:space-y-8 relative z-10">
        <div className="bg-white/10 backdrop-blur-md rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-white drop-shadow-[2px_2px_4px_rgba(0,0,0,0.8)]">
              ThingSpeak Data Records
            </h1>
            <Link to="/dashboard">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white/20 hover:border-white/50"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </div>
          <div className="w-20 sm:w-32 h-1 bg-gradient-to-r from-emerald-400 to-green-400 rounded-full mb-4"></div>
          <p className="text-white/90 text-sm sm:text-base font-medium drop-shadow-[1px_1px_2px_rgba(0,0,0,0.8)]">
            Complete history of sensor readings from ThingSpeak channel
          </p>
        </div>
        
        <ThingSpeakData />
      </div>
    </div>
  );
}