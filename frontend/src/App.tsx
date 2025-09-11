import { Routes, Route } from "react-router-dom";
import './styles/global.css'; //estilos globales
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import OwnerHome from "./pages/OwnerHome";
import OwnerRestaurantPanel from "./pages/OwnerRestaurantPanel";


const Profile = () => {
  return (
    <main style={{ padding: "2rem", color: "var(--restaurant-cream)" }}>
      <h1>Página de Perfil</h1>
      <p>Esta es la página de tu perfil de usuario. Aquí podrás ver tus datos personales, reservas, suscripción y notificaciones.</p>
    </main>
  );
};


export default function App() {
  return (
    <div style={{ display: "grid", minHeight: "100vh", gridTemplateRows: "auto 1fr auto" }}>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/ownerDashboard" element={<OwnerHome />} />
        <Route path="/ownerDashboard/restaurant/:id" element={<OwnerRestaurantPanel />} />
      </Routes>
      <Footer />
    </div>
  );
}
