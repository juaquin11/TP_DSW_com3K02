import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import styles from "./Footer.module.css";
import Logo from "./logo";

const Footer = () => {
  const handleNewsletterSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
  };

  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.content}>
        <div className={styles.brandSection}>
          <Link to="/" className={styles.brandLink} aria-label="Volver al inicio">
            <Logo width="5.5rem" height="5.5rem" />
          </Link>
          <p className={styles.brandDescription}>
            Descubrí los mejores sabores de la ciudad, reservá en segundos y dejate sorprender por
            experiencias gastronómicas únicas.
          </p>
          <div className={styles.socials} aria-label="Redes sociales">
            <a href="https://www.instagram.com" target="_blank" rel="noreferrer">
              <span aria-hidden>📸</span>
              
            </a>
            <a href="https://www.facebook.com" target="_blank" rel="noreferrer">
              <span aria-hidden>👍</span>
             
            </a>
            <a href="https://www.twitter.com" target="_blank" rel="noreferrer">
              <span aria-hidden>🐦</span>
              
            </a>
          </div>
        </div>

        <nav className={styles.linksSection} aria-label="Enlaces útiles">
          <h2>Explorá</h2>
          <ul>
            <li>
              <Link to="/">Inicio</Link>
            </li>
            <li>
              <Link to="/profile">Mi perfil</Link>
            </li>
            <li>
              <Link to="/ownerDashboard">Panel de dueños</Link>
            </li>
            <li>
              <Link to="/register">Registrate</Link>
            </li>
          </ul>
        </nav>

        <div className={styles.contactSection}>
          <h2>Contacto</h2>
          <ul>
            <li>
              <span className={styles.contactLabel}>Email:</span>
              <a>support@foodapp.com</a>
            </li>
            <li>
              <span className={styles.contactLabel}>Teléfono:</span>
              <a>+54 11 2345-6789</a>
            </li>
            <li>
              <span className={styles.contactLabel}>Dirección:</span>
              <span>Zeballos 1341, Rosario</span>
            </li>
          </ul>
        </div>

        <div className={styles.newsletterSection}>
          <h2>Newsletter</h2>
          <p>Mantenete al día con lanzamientos exclusivos y beneficios para foodies.</p>
          <form onSubmit={handleNewsletterSubmit} className={styles.newsletterForm}>
            <label className="sr-only" htmlFor="newsletter-email">
              Ingresá tu correo electrónico
            </label>
            <input id="newsletter-email" type="email" placeholder="tu@correo.com" required />
            <button type="submit">Suscribirme</button>
          </form>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <p>© {currentYear} FoodApp. Todos los derechos reservados.</p>
        <div className={styles.legalLinks}>
          <a href="#">Políticas de privacidad</a>
          <a href="#">Términos y condiciones</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
