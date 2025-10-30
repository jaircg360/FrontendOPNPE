import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { DataProvider } from "./contexts/DataContext";
import { AuthProvider } from "./contexts/AuthContext";
import Header from "./components/Layout/Header";
import AppTour from "./components/Tour/AppTour";
import ProtectedRoute from "./components/ProtectedRoute";
import Voting from "./pages/Voting";
import Auth from "./pages/Auth";
import DataUpload from "./pages/DataUpload";
import DataCleaning from "./pages/DataCleaning";
import ModelConfig from "./pages/ModelConfig";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  const [runTour, setRunTour] = useState(false);

  useEffect(() => {
    const hasSeenTour = localStorage.getItem('hasSeenTour');
    if (!hasSeenTour) {
      setRunTour(true);
    }
  }, []);

  const handleTourComplete = () => {
    setRunTour(false);
    localStorage.setItem('hasSeenTour', 'true');
  };

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <DataProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen bg-background">
                <Header />
                <main>
                  <Routes>
                    <Route path="/" element={<Voting />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route
                      path="/dashboard"
                      element={
                        <ProtectedRoute requireAdmin>
                          <Dashboard />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/upload"
                      element={
                        <ProtectedRoute requireAdmin>
                          <DataUpload />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/cleaning"
                      element={
                        <ProtectedRoute requireAdmin>
                          <DataCleaning />
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/config"
                      element={
                        <ProtectedRoute requireAdmin>
                          <ModelConfig />
                        </ProtectedRoute>
                      }
                    />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
              </div>
              <AppTour run={runTour} onComplete={handleTourComplete} />
            </BrowserRouter>
          </DataProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
