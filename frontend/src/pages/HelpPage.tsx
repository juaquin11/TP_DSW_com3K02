import React from 'react';
import { Link } from 'react-router-dom';
import styles from './Help.module.css';

const HelpPage: React.FC = () => {
  return (
    <main className={styles.container}>
      <section className={styles.hero}>
        <h1>¿Necesitas ayuda?</h1>
        <p>Encuentra respuestas rápidas y consejos para sacar el máximo provecho de FoodApp.</p>
      </section>

      <section className={styles.grid}>
        <article className={styles.card}>
          <h2>Gestión de cuenta</h2>
          <p>
            Actualiza tus datos personales, revisa tus reservas y mantén tus preferencias al día desde la sección{' '}
            <Link to="/profile">Mi Perfil</Link>.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Suscripciones y beneficios</h2>
          <p>
            Consulta tus beneficios activos, descubre nuevos planes y resuelve dudas frecuentes sobre pagos desde{' '}
            <Link to="/profile?tab=subscription">Suscripciones</Link>.
          </p>
        </article>

        <article className={styles.card}>
          <h2>Contacta a soporte</h2>
          <p>
            ¿No encontraste lo que buscabas? Escríbenos a{' '}
            <a href="mailto:soporte@foodapp.com">soporte@foodapp.com</a> y nuestro equipo responderá a la brevedad.
          </p>
        </article>
      </section>
    </main>
  );
};

export default HelpPage;