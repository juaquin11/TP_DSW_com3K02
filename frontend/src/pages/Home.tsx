import React, { useEffect, useState } from 'react';
import { fetchRestaurants} from '../services/restaurantService';
import type { RestaurantDTO } from '../types/restaurant';
import RestaurantCard from '../components/RestaurantCard';
// import '../styles/Home_Page.css'; // move your Home_Page.css here

const Home: React.FC = () => {
  const [restaurants, setRestaurants] = useState<RestaurantDTO[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [query, setQuery] = useState<string>('');
  const [districtFilter, setDistrictFilter] = useState<string>(''); // visual filter
  const [uniqueDistricts, setUniqueDistricts] = useState<string[]>([]);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const data = await fetchRestaurants();
        setRestaurants(data);
        // build unique district list for the select
        const districts = Array.from(new Set(data.map((r) => r.districtName ?? r.id_district)));
        setUniqueDistricts(districts.filter(Boolean) as string[]);
      } catch (err) {
        console.error('Error loading restaurants', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // client-side visual filtering (for now)
  const filtered = restaurants.filter((r) => {
    const q = query.trim().toLowerCase();
    if (q) {
      const matches = (r.name + ' ' + (r.street ?? '') + ' ' + (r.districtName ?? '')).toLowerCase();
      if (!matches.includes(q)) return false;
    }
    if (districtFilter) {
      const d = (r.districtName ?? r.id_district).toLowerCase();
      if (d !== districtFilter.toLowerCase()) return false;
    }
    return true;
  });

  return (
    <main className="home-page">
      <header className="home-header">
        <h1>Restaurants</h1>
        <div className="search-controls">
          <input
            aria-label="Search restaurants"
            placeholder="Search by name, street or district"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <select value={districtFilter} onChange={(e) => setDistrictFilter(e.target.value)}>
            <option value="">All districts</option>
            {uniqueDistricts.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="restaurant-list">
        {loading ? (
          <p>Loading restaurants...</p>
        ) : filtered.length === 0 ? (
          <p>No restaurants found</p>
        ) : (
          filtered.map((r) => <RestaurantCard key={r.id_restaurant} restaurant={r} />)
        )}
      </section>
    </main>
  );
};

export default Home;
