import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/authService";
import { useAuth } from '../context/AuthContext'; // Importa el hook de autenticación

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // Obtiene la función de login del contexto
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await registerUser({ email, password });
      login(result.token); // Usa el token para iniciar sesión en el contexto
      alert("Usuario registrado y logueado.");
      navigate("/"); // Redirige al inicio
    } catch (err: any) {
      console.error("❌ Error al registrar:", err.response?.data || err.message);
      alert("Error al registrar");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Registro</h2>
      <input
        type="email"
        placeholder="Correo"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button type="submit">Registrar</button>
    </form>
  );
}

export default Register;