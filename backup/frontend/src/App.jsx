import { Routes, Route, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Wallet from "./pages/Wallet";
import Ratings from "./pages/Ratings";
import Security from "./pages/Security";
import Login from "./components/LoginModal";
import CreatorProfilesPage from "./pages/CreatorProfilesPage";
import ProjectList from "./pages/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";
import BrandDetail from "./pages/BrandDetail";
import BrandDashboardViewer from "./pages/BrandDashboardViewer";
import CreatorDashboardViewer from "./pages/CreatorDashboardViewer";
import NotFound from "./pages/NotFound";
import MutualPage from "./pages/MutualPage";
import DisputeDetail from "./pages/DisputeDetail";

import "./App.css"; // ✅ global import

function App() {
  const location = useLocation();

  const isHome = location.pathname === "/";

  return (
    <div className={isHome ? "home-wrapper" : "app-wrapper"}>
      {!isHome && <Navbar />}

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/wallet" element={<Wallet />} />
        <Route path="/ratings" element={<Ratings />} />
        <Route path="/security" element={<Security />} />
        <Route path="/creators" element={<CreatorProfilesPage />} />

        <Route path="/projects" element={<ProjectList />} />
        <Route path="/projects/:id" element={<ProjectDetail />} />

        <Route path="/brands/:id" element={<BrandDetail />} />
        <Route path="/brands/:id/dashboard" element={<BrandDashboardViewer />} />
        <Route
          path="/creators/:id/dashboard"
          element={<CreatorDashboardViewer />}
        />

        <Route path="/mutual" element={<MutualPage />} />
        <Route path="/mutual/:collabId" element={<MutualPage />} />
        <Route path="/disputes/:disputeId" element={<DisputeDetail />} />

        <Route path="*" element={<NotFound />} />
      </Routes>

      {!isHome && <Footer />}
    </div>
  );
}

export default App;
