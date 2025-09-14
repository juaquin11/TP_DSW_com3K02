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
        <div className={styles.list}>
          {categories.map((cat) => (
            <label key={cat.id_category} className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={selectedCategories.has(cat.id_category)}
                onChange={() => onToggle(cat.id_category)}
              />
              {cat.name}
            </label>
          ))}
        </div>
        <button onClick={onClose} className={styles.closeButton}>Cerrar</button>
      </div>
    </div>
  );
};

export default CategoryModal;