import React, { useCallback, useEffect, useRef, useState } from "react";
import RestaurantCard from "./RestaurantCard";
import type { RestaurantWithDiscounts } from "../types/restaurant";
import styles from "./RestaurantCarousel.module.css";

type CarouselBadgeVariant = "gold" | "plum" | "emerald" | "rose";

type CarouselItem = {
  restaurant: RestaurantWithDiscounts;
  badgeLabel?: string;
  badgeVariant?: CarouselBadgeVariant;
  highlightText?: string;
};

interface RestaurantCarouselProps {
  title: string;
  description?: string;
  items: CarouselItem[];
  onRestaurantClick: (id: string) => void;
  emptyMessage?: string;
}

const SCROLL_EASING = 0.9;

const RestaurantCarousel: React.FC<RestaurantCarouselProps> = ({
  title,
  description,
  items,
  onRestaurantClick,
  emptyMessage = "No hay restaurantes para mostrar en este momento.",
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const node = scrollRef.current;
    if (!node) {
      setCanScrollLeft(false);
      setCanScrollRight(false);
      return;
    }

    const { scrollLeft, scrollWidth, clientWidth } = node;
    setCanScrollLeft(scrollLeft > 8);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 8);
  }, []);

  useEffect(() => {
    updateScrollState();
    const node = scrollRef.current;
    if (!node) return;

    const handleResize = () => updateScrollState();
    node.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", handleResize);

    return () => {
      node.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", handleResize);
    };
  }, [items, updateScrollState]);

  useEffect(() => {
    updateScrollState();
  }, [items.length, updateScrollState]);

  const scrollBy = (direction: "left" | "right") => {
    const node = scrollRef.current;
    if (!node) return;

    const scrollAmount = node.clientWidth * SCROLL_EASING;
    node.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  const carouselItems = items.filter((item): item is CarouselItem => Boolean(item?.restaurant));

  if (carouselItems.length === 0) {
    return (
      <section className={styles.section}>
        <header className={styles.header}>
          <div>
            <h2 className={styles.title}>{title}</h2>
            {description && <p className={styles.description}>{description}</p>}
          </div>
        </header>
        <div className={styles.emptyState}>{emptyMessage}</div>
      </section>
    );
  }

  return (
    <section className={styles.section}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{title}</h2>
          {description && <p className={styles.description}>{description}</p>}
        </div>
        <div className={styles.controls}>
          <button
            type="button"
            className={styles.controlButton}
            aria-label="Desplazar a la izquierda"
            onClick={() => scrollBy("left")}
            disabled={!canScrollLeft}
          >
            ‹
          </button>
          <button
            type="button"
            className={styles.controlButton}
            aria-label="Desplazar a la derecha"
            onClick={() => scrollBy("right")}
            disabled={!canScrollRight}
          >
            ›
          </button>
        </div>
      </header>
      <div className={styles.carouselWrapper}>
        <div className={styles.carousel} ref={scrollRef}>
          {carouselItems.map(({ restaurant, badgeLabel, badgeVariant, highlightText }) => (
            <RestaurantCard
              key={restaurant.id_restaurant}
              id={restaurant.id_restaurant}
              name={restaurant.name}
              image={restaurant.image || ""}
              street={restaurant.street}
              height={restaurant.height}
              rating={restaurant.avgRating ?? 0}
              subscriptionNames={restaurant.subscriptionNames}
              onClick={onRestaurantClick}
              badgeLabel={badgeLabel}
              badgeVariant={badgeVariant}
              highlightText={highlightText}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantCarousel