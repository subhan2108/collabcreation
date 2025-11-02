import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/home";
import Onboarding from "./pages/Onboarding";
import Dashboard from "./pages/Dashboard";
import Chat from "./pages/Chat";
import Wallet from "./pages/Wallet";
import Ratings from "./pages/Ratings";
import Security from "./pages/Security";
import Login from "./components/LoginModal"; // Add login route
import CreatorProfilesPage from "./pages/CreatorProfilesPage";
import BrandProfilesPage from "./pages/BrandProfilesPage";
import ProjectList from "./pages/ProjectList";
import ProjectDetail from "./pages/ProjectDetail";
import BrandDetail from "./pages/BrandDetail";
import BrandDashboardViewer from "./pages/BrandDashboardViewer";
import CreatorDashboardViewer from "./pages/CreatorDashboardViewer";
import NotFound from "./pages/NotFound";

function App() {
  return (
    <Router>
      <div className="app-container">
        <Navbar />
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
          <Route path="/brands" element={<BrandProfilesPage />} />
          {/* 💼 Projects */}
          <Route path="/projects" element={<ProjectList />} />
          <Route path="/projects/:id" element={<ProjectDetail />} />
          {/* 🏢 Brand Detail */}
          <Route path="/brands/:id" element={<BrandDetail />} />
          <Route path="/brands/:id/dashboard" element={<BrandDashboardViewer />} />
          <Route path="/creators/:id/dashboard" element={<CreatorDashboardViewer />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
