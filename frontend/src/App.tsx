import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Results from "./pages/Results";
import CoinDetail from "./pages/CoinDetail";
import Compare from "./pages/Compare";
import Watchlist from "./pages/Watchlist";
import News from "./pages/News";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";

export default function App() {
  return (
    <AppProvider>
      <Router>
        <div className="min-h-screen bg-[#0D0F14] text-white">
          <Navbar />
          <Routes>
            {/* Primary flow */}
            <Route path="/" element={<Home />} />
            <Route path="/results/:coin" element={<Results />} />
            <Route path="/coin/:coin" element={<CoinDetail />} />

            {/* Secondary flows */}
            <Route path="/compare" element={<Compare />} />
            <Route path="/watchlist" element={<Watchlist />} />
            <Route path="/news" element={<News />} />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Account */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </div>
      </Router>
    </AppProvider>
  );
}
