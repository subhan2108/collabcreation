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

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-b from-neutral-950 via-neutral-900 to-neutral-950 text-neutral-100 font-sans">
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
        </Routes>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
