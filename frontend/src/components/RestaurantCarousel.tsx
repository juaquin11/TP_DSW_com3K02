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

const SCROLL_TOLERANCE = 2;

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
    setCanScrollLeft(scrollLeft > SCROLL_TOLERANCE);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - SCROLL_TOLERANCE);
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

  const scrollBy = useCallback(
    (direction: "left" | "right") => {
      const node = scrollRef.current;
      if (!node) return;

      const firstItem = node.querySelector<HTMLElement>(`[data-carousel-item="true"]`);
      const isBrowser = typeof window !== "undefined";
      const computedStyles = isBrowser ? window.getComputedStyle(node) : null;
      const gapValue = computedStyles?.columnGap || computedStyles?.gap || "0";
      const gap = Number.parseFloat(gapValue) || 0;
      const itemWidth = firstItem?.getBoundingClientRect().width ?? 0;
      const fallbackAmount = node.clientWidth * 0.9;
      const scrollAmount = itemWidth > 0 ? itemWidth + gap : fallbackAmount;

      node.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });

      if (isBrowser) {
        window.requestAnimationFrame(updateScrollState);
      } else {
        updateScrollState();
      }
    },
    [updateScrollState]
  );

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
            <div
              key={restaurant.id_restaurant}
              className={styles.carouselItem}
              data-carousel-item="true"
            >
              <RestaurantCard
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RestaurantCarousel;