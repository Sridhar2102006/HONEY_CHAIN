import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import AppRoutes from "./routes/AppRoutes.jsx";
import SplashScreen from "./components/mobile/SplashScreen.jsx";
import capacitorService from "./services/capacitorService.js";

export default function App() {
  const [showSplash, setShowSplash] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize native device integration: StatusBar, hardware back button, splash screen
    capacitorService.initNativeApp(navigate);
  }, [navigate]);

  return (
    <>
      {showSplash && (
        <SplashScreen
          onFinish={() => {
            setShowSplash(false);
            capacitorService.hideSplashScreen();
          }}
        />
      )}
      <AppRoutes />
    </>
  );
}
