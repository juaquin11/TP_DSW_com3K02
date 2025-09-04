import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css"; // import con alias "styles"
import Logo from "./logo";
import { useNavigate } from "react-router-dom";



const Navbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    // podés hacer cosas antes, ej: limpiar estados, logs, etc.
    navigate("/login");
  };

  const handleRegisterClick = () => {
    // podés hacer cosas antes, ej: limpiar estados, logs, etc.
    navigate("/register");
  };

  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.topNav}>
          <div className={styles.logo}>
            <Link to="/">{<Logo width="3rem" height="3rem"></Logo>}</Link>
            <h1><Link to="/">FoodApp</Link></h1>
          </div>

          <div className={styles.actions}>
            <button onClick={handleLoginClick} className={`${styles.loginButton} ${styles.loginButtonVisible}`}>Login</button>
            <button onClick={handleRegisterClick} className={`${styles.registerButton} ${styles.registerButtonVisible}`}>Register</button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
