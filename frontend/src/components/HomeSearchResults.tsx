import React from 'react';
import styles from './HomeSearchResults.module.css';
import type { RestaurantSearchResultItem } from '../types/restaurant';
import { API_BASE_URL } from '../services/apiClient';

interface HomeSearchResultsProps {
  query: string;
  results: RestaurantSearchResultItem[];
  isSearching: boolean;
  hasSearched: boolean;
  error: string | null;
  onRestaurantClick: (id: string) => void;
}

const formatRating = (rating: number | null) => {
  if (rating === null) {
    return '—';
  }

  return rating.toFixed(1);
};

const HomeSearchResults: React.FC<HomeSearchResultsProps> = ({
  query,
  results,
  isSearching,
  hasSearched,
  error,
  onRestaurantClick,
}) => {
  const hasResults = results.length > 0;

  return (
    <section className={styles.resultsSection} aria-live="polite">
      <div className={styles.resultsHeader}>
        <div>
          <h2 className={styles.resultsTitle}>Resultados de tu búsqueda</h2>
          <p className={styles.resultsSubtitle}>
            {query
              ? `Mostrando ${results.length} coincidencia${results.length !== 1 ? 's' : ''} para "${query}"`
              : 'Utilizá el buscador para descubrir nuevas propuestas gastronómicas.'}
          </p>
        </div>
      </div>

      {isSearching && (
        <div className={styles.feedbackCard}>Buscando restaurantes cercanos a tu búsqueda...</div>
      )}

      {!isSearching && error && (
        <div className={`${styles.feedbackCard} ${styles.feedbackError}`}>{error}</div>
      )}

      {!isSearching && !error && hasSearched && !hasResults && (
        <div className={styles.feedbackCard}>
          No encontramos restaurantes que coincidan con tu búsqueda. Probá con otro plato o categoría.
        </div>
      )}

      {!isSearching && !error && hasResults && (
        <div className={styles.resultsGrid}>
          {results.map(result => {
            const imageUrl = result.image ? `${API_BASE_URL}${result.image}` : undefined;
            const location = result.districtName
              ? `${result.street} ${result.height} · ${result.districtName}`
              : `${result.street} ${result.height}`;

            return (
              <button
                type="button"
                key={result.id_restaurant}
                className={styles.resultCard}
                onClick={() => onRestaurantClick(result.id_restaurant)}
              >
                <div
                  className={styles.resultImage}
                  style={imageUrl ? { backgroundImage: `url(${imageUrl})` } : undefined}
                />
                <div className={styles.resultBody}>
                  <div className={styles.resultHeading}>
                    <h3 className={styles.resultName}>{result.name}</h3>
                    <span className={styles.ratingBadge}>
                      <span className={styles.ratingStar}>★</span>
                      <span>{formatRating(result.avgRating)}</span>
                    </span>
                  </div>
                  <p className={styles.resultLocation}>{location}</p>
                  <p className={styles.matchSummary}>{result.matchSummary}</p>
                  <div className={styles.tagList}>
                    {result.matchedCategories.map(category => (
                      <span key={`cat-${result.id_restaurant}-${category}`} className={styles.tag}>
                        #{category}
                      </span>
                    ))}
                    {result.matchedDishes.slice(0, 2).map(dish => (
                      <span key={`dish-${result.id_restaurant}-${dish}`} className={`${styles.tag} ${styles.dishTag}`}>
                        {dish}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
};

export default HomeSearchResults;