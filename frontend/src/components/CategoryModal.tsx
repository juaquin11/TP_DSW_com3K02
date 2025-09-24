import React from 'react';
import styles from './CategoryModal.module.css';
import type { Category } from '../types/category';

interface Props {
  categories: Category[];
  selectedCategories: Set<string>;
  onToggle: (id: string) => void;
  onClose: () => void;
}

const CategoryModal: React.FC<Props> = ({ categories, selectedCategories, onToggle, onClose }) => {
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h3>Selecciona las Categorías</h3>
        <div className={styles.categoryGrid}>
          {categories.map((cat) => (
            <button
              key={cat.id_category}
              type="button"
              className={`${styles.categoryChip} ${selectedCategories.has(cat.id_category) ? styles.selected : ''}`}
              onClick={() => onToggle(cat.id_category)}
            >
              {cat.name}
            </button>
          ))}
        </div>
        <div className={styles.buttonContainer}>
          <button onClick={onClose} className={styles.closeButton}>Confirmar</button>
        </div>
      </div>
    </div>
  );
};

export default CategoryModal;
