import React, { useEffect, useRef } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { gsap } from "gsap";
import Dashboard from "./pages/Dashboard";
import Analytics from "./pages/Analytics";
import GlobalView from "./pages/GlobalView";
import RealTime from "./pages/RealTime";
import Insights from "./pages/Insights";
import AdvancedHeader from "./components/AdvancedHeader";

function App() {
  const appRef = useRef(null);

  useEffect(() => {
    // GSAP app entrance animation
    if (appRef.current) {
      gsap.fromTo(appRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 1.5, ease: "power2.out" }
      );
    }
  }, []);

  return (
    <Router>
      <div
        ref={appRef}
        className="relative min-h-screen w-full bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 overflow-x-hidden"
      >
        {/* Main Content */}
        <div className="relative z-10">
          <AdvancedHeader />
          <main>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/analytics" element={<Analytics />} />
              <Route path="/global-view" element={<GlobalView />} />
              <Route path="/real-time" element={<RealTime />} />
              <Route path="/insights" element={<Insights />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;
