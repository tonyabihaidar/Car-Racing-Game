import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./contexts/ThemeContext";

import Home from "./pages/Home";
import AESVisualizer from "./pages/AESVisualizer";
import AESFullText from "./pages/AESFullText";
import AESInfo from "./pages/AESInfo";
import AESSingleBlockDecryption from "./pages/AESSingleBlockDecryption";
import AESFullTextDecryption from "./pages/AESFullTextDecryption";
import SecurityAnalysis from "./pages/SecurityAnalysis";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import Dashboard from "./pages/Dashboard";
import ResetPassword from './pages/ResetPassword';

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <Routes>
          {/* Auth routes */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Home dashboard */}
          <Route path="/home" element={<Home />} />

          {/* Tools */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/aes-info" element={<AESInfo />} />
          
          {/* Encryption */}
          <Route path="/aes/full-text" element={<AESFullText />} />
          <Route path="/aes" element={<AESVisualizer />} />
          
          {/* Decryption */}
          <Route path="/aes/decrypt/full-text" element={<AESFullTextDecryption />} />
          <Route path="/aes/decrypt" element={<AESSingleBlockDecryption />} />
          
          {/* Security */}
          <Route path="/security" element={<SecurityAnalysis />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;