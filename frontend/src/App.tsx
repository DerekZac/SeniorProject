import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AppProvider } from "./context/AppContext";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import CoinPage from "./pages/CoinPage";
import Compare from "./pages/Compare";
import Watchlist from "./pages/Watchlist";
import News from "./pages/News";
import Learn from "./pages/Learn";
import Regulations from "./pages/Regulations";
import Exchanges from "./pages/Exchanges";
import Tools from "./pages/Tools";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Profile from "./pages/Profile";
import { useTheme } from "./lib/useTheme";

export default function App() {
  useTheme();

  return (
    <AuthProvider>
      <AppProvider>
        <Router basename={import.meta.env.BASE_URL}>
          <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--text)' }}>
            <Navbar />
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<Home />} />
              <Route path="/results/:coin" element={<CoinPage />} />
              <Route path="/coin/:coin" element={<CoinPage />} />
              <Route path="/compare" element={<Compare />} />
              <Route path="/news" element={<News />} />
              <Route path="/learn" element={<Learn />} />
              <Route path="/regulations" element={<Regulations />} />
              <Route path="/exchanges" element={<Exchanges />} />
              <Route path="/tools" element={<Tools />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />

              {/* Protected routes — require authentication */}
              <Route path="/watchlist" element={
                <ProtectedRoute><Watchlist /></ProtectedRoute>
              } />
              <Route path="/profile" element={
                <ProtectedRoute><Profile /></ProtectedRoute>
              } />
            </Routes>
          </div>
        </Router>
      </AppProvider>
    </AuthProvider>
  );
}
