import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginUser } from "../services/authService";
import { useAuth } from '../context/AuthContext'; // Importa el hook de autenticación

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { login } = useAuth(); // Obtiene la función de login del contexto
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await loginUser({ email, password });
      login(result.token); // Usa el token para iniciar sesión en el contexto
      alert("Inicio de sesión exitoso");
      navigate("/"); // Redirige al inicio
    } catch (err: any) {
      console.error("❌ Error al iniciar sesión:", err.response?.data || err.message);
      alert("Error al iniciar sesión");
    }
  };

  return (
    <main style={{ padding: "1rem" }}>
      <h1>Login Page</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email">Email: </label>
          <input 
            id="email" 
            type="email" 
            name="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="password">Password: </label>
          <input 
            id="password" 
            type="password" 
            name="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Log In</button>
      </form>
    </main>
  );
}