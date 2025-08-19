import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css"; // vamos a crear este archivo

const Navbar: React.FC = () => {
  return (
    <nav className="navbar">
      <div className="navbar__logo">
        <Link to="/">🍽️ FoodApp</Link>
      </div>
      <ul className="navbar__links">
        <li><Link to="/">Home</Link></li>
        <li><Link to="/login">Login</Link></li>
        <li><Link to="/register">Register</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;
