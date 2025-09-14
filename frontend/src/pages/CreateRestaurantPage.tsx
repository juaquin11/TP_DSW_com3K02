import React from 'react';
import CreateRestaurantForm from '../components/CreateRestaurantForm';
import styles from './CreateRestaurantPage.module.css';

const CreateRestaurantPage: React.FC = () => {
  return (
    <main className={styles.container}>
      <h1 className={styles.title}>Registrar un Nuevo Restaurante</h1>
      <p className={styles.subtitle}>
        Completa los siguientes campos para dar de alta tu establecimiento en la plataforma.
      </p>
      <CreateRestaurantForm />
    </main>
  );
};

export default CreateRestaurantPage;