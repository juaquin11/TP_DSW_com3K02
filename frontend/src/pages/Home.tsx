import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  fetchRestaurantsWithDiscounts,
  fetchSearchSuggestions,
  searchRestaurants as searchRestaurantsRequest,
} from '../services/restaurantService';
import type {
  RestaurantWithDiscounts,
  RestaurantSearchResultItem,
  RestaurantSearchSuggestions,
} from '../types/restaurant';
import styles from "./Home.module.css";
import { useAuth } from '../context/AuthContext';
import RestaurantCarousel from '../components/RestaurantCarousel';
import HomeSearchBar from '../components/HomeSearchBar';
import HomeSearchResults from '../components/HomeSearchResults';

const CAROUSEL_LIMIT = 8;
const EMPTY_SUGGESTIONS: RestaurantSearchSuggestions = { restaurants: [], dishes: [], categories: [] };

const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantWithDiscounts[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<RestaurantSearchResultItem[]>([]);
  const [searchSuggestions, setSearchSuggestions] = useState<RestaurantSearchSuggestions>(EMPTY_SUGGESTIONS);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState<boolean>(false);
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [activeSearchTerm, setActiveSearchTerm] = useState<string>('');
  const { token } = useAuth();
  const navigate = useNavigate();

  const handleRestaurantClick = (restaurantId: string) => {
    if (restaurantId) {
      navigate(`/restaurant/${restaurantId}`);
    }
  };

  useEffect(() => {
    async function getRestaurants() {
      try {
        const data = await fetchRestaurantsWithDiscounts();
        setRestaurants(data);
      } catch (err: unknown) {
        console.error('Failed to fetch restaurants:', err);
        setError(err instanceof Error ? err.message : 'No pudimos cargar los restaurantes.');
      } finally {
        setLoading(false);
      }
    }
    
    getRestaurants();
  }, [token]);

  useEffect(() => {
    const trimmedQuery = searchQuery.trim();

    if (trimmedQuery.length < 2) {
      setSearchSuggestions({ ...EMPTY_SUGGESTIONS });
      setIsFetchingSuggestions(false);
      return;
    }

    let cancelled = false;
    setIsFetchingSuggestions(true);

    const debounceHandle = window.setTimeout(async () => {
      try {
        const response = await fetchSearchSuggestions(trimmedQuery, 6);
        if (!cancelled) {
          setSearchSuggestions(response.suggestions);
        }
      } catch (suggestionError) {
        if (!cancelled) {
          console.error('No se pudieron obtener sugerencias de búsqueda', suggestionError);
        }
      } finally {
        if (!cancelled) {
          setIsFetchingSuggestions(false);
        }
      }
    }, 300);

    return () => {
      cancelled = true;
      clearTimeout(debounceHandle);
    };
  }, [searchQuery]);

  const executeSearch = useCallback(async (rawQuery: string) => {
    const trimmed = rawQuery.trim();

    if (!trimmed) {
      setSearchQuery('');
      setSearchResults([]);
      setSearchError(null);
      setHasSearched(false);
      setActiveSearchTerm('');
      return;
    }

    setSearchQuery(trimmed);
    setIsSearching(true);
    setSearchError(null);

    try {
      const response = await searchRestaurantsRequest(trimmed, { limit: 18, suggestionsLimit: 6 });
      setSearchResults(response.results);
      setSearchSuggestions(response.suggestions);
      setActiveSearchTerm(trimmed);
      setHasSearched(true);
    } catch (searchErr: unknown) {
      console.error('Error al buscar restaurantes', searchErr);
      setSearchError('No pudimos realizar la búsqueda. Intentá nuevamente.');
      setHasSearched(true);
    } finally {
      setIsSearching(false);
    }
  }, []);

  const numberFormatter = useMemo(() => new Intl.NumberFormat('es-AR'), []);

  const totalReviews = useMemo(() => {
    return restaurants.reduce((acc, restaurant) => acc + (restaurant.reviewCount ?? 0), 0);
  }, [restaurants]);

  const formattedRestaurantCount = useMemo(() => numberFormatter.format(restaurants.length), [numberFormatter, restaurants.length]);
  const formattedReviewCount = useMemo(() => numberFormatter.format(totalReviews), [numberFormatter, totalReviews]);

  const bestRatedRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.avgRating ?? 0) - (a.avgRating ?? 0))
      .slice(0, CAROUSEL_LIMIT);
  }, [restaurants]);

  const mostBookedRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => (b.reviewCount ?? 0) - (a.reviewCount ?? 0))
      .slice(0, CAROUSEL_LIMIT);
  }, [restaurants]);

  const newestRestaurants = useMemo(() => {
    return [...restaurants]
      .sort((a, b) => {
        const reviewDifference = (a.reviewCount ?? 0) - (b.reviewCount ?? 0);
        if (reviewDifference !== 0) {
          return reviewDifference;
        }
        return (b.avgRating ?? 0) - (a.avgRating ?? 0);
      })
      .slice(0, CAROUSEL_LIMIT);
  }, [restaurants]);

  const bestRatedItems = useMemo(() => bestRatedRestaurants.map((restaurant, index) => ({
    restaurant,
    badgeLabel: `Top ${index + 1}`,
    badgeVariant: 'gold' as const,
    highlightText: restaurant.reviewCount ? `${restaurant.reviewCount} reseñas` : 'Primera reseña',
  })), [bestRatedRestaurants]);

 const mostBookedItems = useMemo(() => mostBookedRestaurants.map((restaurant, index) => ({
    restaurant,
    badgeLabel: index === 0 ? 'Más elegido' : `Favorito ${index + 1}`,
    badgeVariant: 'emerald' as const,
    highlightText: restaurant.reviewCount ? `${restaurant.reviewCount} experiencias` : 'Tendencia',
  })), [mostBookedRestaurants]);

  const newestItems = useMemo(() => newestRestaurants.map((restaurant) => ({
    restaurant,
    badgeLabel: 'Nuevo',
    badgeVariant: 'plum' as const,
    highlightText: 'Recién llegado',
  })), [newestRestaurants]);

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <p className={styles.heroEyebrow}>Reservá sin complicaciones</p>
          <h1 className={styles.heroTitle}>Explorá los restaurantes más queridos de la ciudad</h1>
          <p className={styles.heroSubtitle}>
            Descubrí lugares únicos, aprovechá beneficios exclusivos y asegurá tu mesa en cuestión de segundos.
          </p>
          <HomeSearchBar
            query={searchQuery}
            suggestions={searchSuggestions}
            isSearching={isSearching}
            isFetchingSuggestions={isFetchingSuggestions}
            onQueryChange={setSearchQuery}
            onSubmit={executeSearch}
            onSuggestionSelect={setSearchQuery}
            />
          <div className={styles.heroActions}>
            <a href="#mejores-valorados" className={styles.heroPrimaryAction}>Ver destacados</a>
            <a href="#nuevos" className={styles.heroSecondaryAction}>Explorar novedades</a>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatValue}>{formattedRestaurantCount}</span>
              <span className={styles.heroStatLabel}>Restaurantes disponibles</span>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatValue}>{formattedReviewCount}</span>
              <span className={styles.heroStatLabel}>Reseñas verificadas</span>
            </div>
            <div className={styles.heroStatCard}>
              <span className={styles.heroStatValue}>24/7</span>
              <span className={styles.heroStatLabel}>Reservá cuando quieras</span>
            </div>
          </div>
        </div>
      </section>

      <HomeSearchResults
        query={activeSearchTerm}
        results={searchResults}
        isSearching={isSearching}
        hasSearched={hasSearched}
        error={searchError}
        onRestaurantClick={handleRestaurantClick}
      />

      {loading && (
        <section className={styles.feedbackSection}>
          <div className={styles.feedbackCard}>Cargando restaurantes...</div>
        </section>
      )}

      {error && !loading && (
        <section className={styles.feedbackSection}>
          <div className={styles.feedbackCard}>{error}</div>
        </section>
      )}

      {!loading && !error && (
        <>
          <section id="mejores-valorados">
            <RestaurantCarousel
              title="Mejores valorados"
              description="Los favoritos de la comunidad con calificaciones sobresalientes y atención impecable."
              items={bestRatedItems}
              onRestaurantClick={handleRestaurantClick}
            />
          </section>

          <section id="mas-elegidos">
            <RestaurantCarousel
              title="Más elegidos del mes"
              description="Los restaurantes con mayor movimiento y mesas reservadas durante las últimas semanas."
              items={mostBookedItems}
              onRestaurantClick={handleRestaurantClick}
              emptyMessage="Todavía no tenemos datos de reservas. ¡Pronto habrá novedades!"
            />
          </section>

          <section id="nuevos">
            <RestaurantCarousel
              title="Nuevos en la plataforma"
              description="Propuestas recientes para que descubras sabores frescos antes que nadie."
              items={newestItems}
              onRestaurantClick={handleRestaurantClick}
              emptyMessage="Aún no hay nuevos restaurantes para mostrar."
            />
          </section>
        </>
      )}
    </main>
  );
};

export default Home;