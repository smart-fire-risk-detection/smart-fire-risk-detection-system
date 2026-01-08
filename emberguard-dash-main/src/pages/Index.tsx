import { useEffect } from "react";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

const Index = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  // ✅ Authentication redirect
  useEffect(() => {
    if (!loading && !user) {
      setTimeout(() => {
        navigate("/auth");
      }, 100);
    }
  }, [user, loading, navigate]);

  // ✅ Loading UI
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // ✅ Auth protection
  if (!user) return null;

  // ✅ Final UI
  return (
    <div className="min-h-screen bg-black text-white">
      <h1 className="text-3xl font-bold text-center pt-6">
        <span className="text-orange-500">🔥</span> EmberGuard Dashboard
      </h1>

      <Separator className="my-6" />

      {/* Main Dashboard */}
      <Dashboard />
    </div>
  );
};

export default Index;
