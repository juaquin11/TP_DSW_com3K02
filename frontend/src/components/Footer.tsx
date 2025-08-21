import React from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import Logo from "./logo";

const Footer: React.FC = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.links}>
        <Link to='/'>Home</Link>
        <Logo width="6rem" height="6rem"></Logo>
        <Link to='/'>Otro enlace...</Link>
      </div>
      <p>© {new Date().getFullYear()} FoodApp. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
