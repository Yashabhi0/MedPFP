import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "sonner";
import ProtectedRoute from './components/auth/ProtectedRoute';
import Landing from "./pages/Landing";
import Auth from "./pages/Auth";
import SSOCallback from "./pages/SSOCallback";
import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import DoctorDashboard from "./pages/DoctorDashboard";
import DoctorPatients from "./pages/DoctorPatients";
import Passport from "./pages/Passport";
import NotFound from "./pages/NotFound";

import MsgPage from "./pages/MsgPage";

import Doctors from "./pages/Doctors";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Auth />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/sso-callback" element={<SSOCallback />} />
          <Route path="/dashboard" element={<ProtectedRoute redirectTo="/auth"><Dashboard /></ProtectedRoute>} />
          <Route path="/dashboard/upload" element={<ProtectedRoute redirectTo="/auth"><Upload /></ProtectedRoute>} />
          <Route path="/doctor" element={<ProtectedRoute redirectTo="/auth"><DoctorDashboard /></ProtectedRoute>} />
          <Route path="/doctor/patients" element={<ProtectedRoute redirectTo="/auth"><DoctorPatients /></ProtectedRoute>} />
          <Route path="/passport/demo" element={<Passport />} />
          <Route path="/passport/:passportCode" element={<Passport />} />
          <Route path="/msg" element={<MsgPage />} />
          <Route path="/doctors" element={<Doctors />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="bottom-center" richColors />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
