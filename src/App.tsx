import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/context/auth";
import { ColorGradingProvider } from "@/context/color-grading";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import SignIn from "@/pages/auth/SignIn";
import SignUp from "@/pages/auth/SignUp";
import Contacts from "@/pages/Contacts";
import CallPage from "@/pages/Call";
import NotificationsListener from "@/components/NotificationsListener";

const queryClient = new QueryClient();
 
const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <ColorGradingProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <NotificationsListener />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth/sign-in" element={<SignIn />} />
              <Route path="/auth/sign-up" element={<SignUp />} />
              <Route
                path="/contacts"
                element={
                  <ProtectedRoute>
                    <Contacts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/call/:callId"
                element={
                  <ProtectedRoute>
                    <CallPage />
                  </ProtectedRoute>
                }
              />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </ColorGradingProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);
 
export default App;
