import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import Login from "./pages/Login.tsx";
import Dashboard from "./pages/Dashboard.tsx";
import Scan from "./pages/Scan.tsx";
import Recipes from "./pages/Recipes.tsx";
import Family from "./pages/Family.tsx";
import Gamification from "./pages/Gamification.tsx";
import SettingsPage from "./pages/Settings.tsx";
import NutritionProfile from "./pages/NutritionProfile.tsx";
import PrivacyPolicy from "./pages/PrivacyPolicy.tsx";
import TermsOfUse from "./pages/TermsOfUse.tsx";
import DataUsage from "./pages/DataUsage.tsx";
import NotFound from "./pages/NotFound.tsx";
import { AppShell } from "./components/AppShell.tsx";
import { AuthProvider } from "./hooks/use-auth";
import { ProtectedRoute } from "./components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/app"
              element={
                <ProtectedRoute>
                  <AppShell />
                </ProtectedRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="escanear" element={<Scan />} />
              <Route path="receitas" element={<Recipes />} />
              <Route path="familia" element={<Family />} />
              <Route path="gamificacao" element={<Gamification />} />
              <Route path="configuracoes" element={<SettingsPage />} />
              <Route path="perfil-nutricional" element={<NutritionProfile />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

