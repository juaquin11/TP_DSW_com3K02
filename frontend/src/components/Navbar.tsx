import React from "react";
import { Link } from "react-router-dom";
import styles from "./Navbar.module.css"; // import con alias "styles"

const Navbar: React.FC = () => {
  return (
    <nav className={styles.navbar}>
      <div className={styles.logo}>
        <Link to="/">🍽️ FoodApp</Link>
      </div>
      <ul className={styles.links}>
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
