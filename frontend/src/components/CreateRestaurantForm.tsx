import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { CreateRestaurantDTO } from '../types/restaurant';
import { createRestaurant } from '../services/restaurantService';
import { fetchCategories } from '../services/dataService';
import type { Category } from '../types/category';
import styles from './CreateRestaurantForm.module.css';
import CategoryModal from './CategoryModal';
import type { OwnerRestaurantDTO } from '../types/restaurant';


const CreateRestaurantForm: React.FC = () => {
    const navigate = useNavigate();
    // ... (estados existentes para los campos del formulario)
    const [imageFile, setImageFile] = useState<File | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
        setImageFile(e.target.files[0]);
        }
    };
    
    return (
        <section className={styles.container}>
            <h2>Añadir Nuevo Restaurante</h2>
            {/* ... aquí va el JSX del formulario ... */}
        </section>
    );
    
};
export default CreateRestaurantForm;