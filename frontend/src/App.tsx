import type { ReactElement } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import './styles/global.css'; //estilos globales
import Home from "./pages/Home";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import OwnerHome from "./pages/OwnerHome";
import OwnerRestaurantPanel from "./pages/OwnerRestaurantPanel";
import CreateRestaurantPage from "./pages/CreateRestaurantPage";
import RestaurantDetail from "./pages/RestaurantDetail";
import RestaurantReservation from "./components/RestaurantReservation";
import { useAuth } from "./context/AuthContext";
import ProfilePage from "./pages/ProfilePage"; 


const ProtectedRoute = ({ children }: { children: ReactElement }) => {
  const { token } = useAuth();

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default function App() {
  return (
    <div style={{ display: "grid", minHeight: "100vh", gridTemplateRows: "auto 1fr auto" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />
        <Route path="/ownerDashboard" element={<OwnerHome />} />
        <Route path="/ownerDashboard/restaurant/:id" element={<OwnerRestaurantPanel />} />
        <Route path="/ownerDashboard/new-restaurant" element={<CreateRestaurantPage />} /> {/* <-- NUEVA RUTA */}
        <Route path="/restaurant/:id" element={<RestaurantDetail />} />
        <Route
          path="/restaurant/:id/reservar"
          element={(
            <ProtectedRoute>
              <RestaurantReservation restaurantId={""} />
            </ProtectedRoute>
          )}
        />
      </Routes>
      <Footer />
    </div>
  );
}