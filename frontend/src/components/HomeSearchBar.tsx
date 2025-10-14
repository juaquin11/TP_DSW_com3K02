import React, { useMemo, useState } from 'react';
import styles from './HomeSearchBar.module.css';
import type { RestaurantSearchSuggestions } from '../types/restaurant';

interface HomeSearchBarProps {
  query: string;
  suggestions: RestaurantSearchSuggestions;
  isSearching: boolean;
  isFetchingSuggestions: boolean;
  onQueryChange: (value: string) => void;
  onSubmit: (value: string) => void;
  onSuggestionSelect: (value: string) => void;
}

const MIN_CHARS_FOR_SUGGESTIONS = 2;

const HomeSearchBar: React.FC<HomeSearchBarProps> = ({
  query,
  suggestions,
  isSearching,
  isFetchingSuggestions,
  onQueryChange,
  onSubmit,
  onSuggestionSelect,
}) => {
  const [isFocused, setIsFocused] = useState(false);

  const hasSuggestions = useMemo(() => {
    const total = suggestions.restaurants.length + suggestions.categories.length + suggestions.dishes.length;
    return total > 0;
  }, [suggestions]);

  const shouldShowSuggestions =
    isFocused && query.trim().length >= MIN_CHARS_FOR_SUGGESTIONS && (hasSuggestions || isFetchingSuggestions);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(query);
  };

  const handleSuggestionSelect = (value: string) => {
    onSuggestionSelect(value);
    onSubmit(value);
  };

  const renderSuggestionsGroup = (title: string, items: string[]) => {
    if (items.length === 0) {
      return null;
    }

    return (
      <div className={styles.suggestionsGroup} key={title}>
        <p className={styles.suggestionsTitle}>{title}</p>
        <ul className={styles.suggestionsList}>
          {items.map(item => (
            <li key={item}>
              <button
                type="button"
                className={styles.suggestionButton}
                onMouseDown={event => event.preventDefault()}
                onClick={() => handleSuggestionSelect(item)}
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </div>
    );
  };

  const showHelperText = query.trim().length > 0 && query.trim().length < MIN_CHARS_FOR_SUGGESTIONS;

  return (
    <div className={styles.searchContainer}>
      <form className={styles.searchForm} onSubmit={handleSubmit}>
        <label className={styles.searchLabel} htmlFor="home-search-input">
          <span className={styles.searchTitle}>¿Qué se te antoja hoy?</span>
          <span className={styles.searchSubtitle}>
            Buscá por nombre de restaurante, plato o categoría y descubrí nuevas propuestas.
          </span>
        </label>
        <div className={styles.searchFieldWrapper}>
          <div className={styles.inputWrapper}>
            <span className={styles.searchIcon} aria-hidden="true">
              <svg viewBox="0 0 24 24" focusable="false" className={styles.searchIconSvg}>
                <path
                  d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 1 0-.71.71l.27.28v.79l4.5 4.49a1 1 0 0 0 1.42-1.41L15.5 14zm-6 0a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"
                  fill="currentColor"
                />
              </svg>
            </span>
            <input
              id="home-search-input"
              className={styles.searchInput}
              type="text"
              autoComplete="off"
              placeholder="Probá con 'Sushi', 'Pasta' o 'Veggie'"
              value={query}
              onChange={event => onQueryChange(event.target.value)}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setTimeout(() => setIsFocused(false), 120)}
            />
            {isSearching && (
              <span className={styles.loadingIndicator} aria-live="polite">
                Buscando...
              </span>
            )}
          </div>
          <button
            type="submit"
            className={styles.submitButton}
            disabled={query.trim().length === 0 || isSearching}
          >
            Buscar
          </button>
          {shouldShowSuggestions && (
            <div className={styles.suggestionsPanel} role="listbox">
              {isFetchingSuggestions && !hasSuggestions ? (
                <p className={styles.suggestionsFeedback}>Cargando sugerencias...</p>
              ) : (
                <>
                  {renderSuggestionsGroup('Restaurantes', suggestions.restaurants)}
                  {renderSuggestionsGroup('Platos', suggestions.dishes)}
                  {renderSuggestionsGroup('Categorías', suggestions.categories)}
                </>
              )}
            </div>
          )}
        </div>
      </form>
      {showHelperText && (
        <p className={styles.helperText}>Ingresá al menos {MIN_CHARS_FOR_SUGGESTIONS} letras para ver sugerencias.</p>
      )}
    </div>
  );
};

export default HomeSearchBar;