/**
 * TEST F1 - Unitario: RestaurantCard
 * Verifica que el componente renderice correctamente la información del restaurante
 * y responda a interacciones del usuario (click en la tarjeta).
 */
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

// Mockeamos el apiclient para evitar llamadas reales durante el test
vi.mock('../services/apiClient', () => ({
  API_BASE_URL: 'http://test-server',
}));

import RestaurantCard from '../components/RestaurantCard';

// Definimos un restaurante falso y el componente deberia traer y renderizar sus datos.
const defaultProps = {
  id: 'rest-001',
  name: 'La Trattoria del Sur',
  image: '/uploads/trattoria.jpg',
  street: 'Av. Corrientes',
  height: '1234',
  rating: 4.3,
};

describe('RestaurantCard - renderizado', () => {
  it('debe mostrar el nombre, la dirección y el rating del restaurante', () => {
    render(<RestaurantCard {...defaultProps} />);

    // Nombre del restaurante
    expect(screen.getByRole('heading', { level: 2 })).toHaveTextContent('La Trattoria del Sur');

    // Dirección completa
    expect(screen.getByText(/Av\. Corrientes 1234/)).toBeInTheDocument();

    // Rating formateado con un decimal
    expect(screen.getByText('4.3')).toBeInTheDocument();
  });

  it('debe mostrar el badge cuando se proporciona badgeLabel', () => {
    render(<RestaurantCard {...defaultProps} badgeLabel="Top 5" badgeVariant="gold" />);

    expect(screen.getByText('Top 5')).toBeInTheDocument();
  });

  it('NO debe mostrar el banner de descuentos cuando subscriptionNames está vacío', () => {
    render(<RestaurantCard {...defaultProps} subscriptionNames="" />);

    expect(screen.queryByText('Descuentos para:')).not.toBeInTheDocument();
  });

  it('debe mostrar el banner de descuentos cuando subscriptionNames tiene valor', () => {
    render(
      <RestaurantCard
        {...defaultProps}
        subscriptionNames="Plan Premium, Plan Gold"
      />,
    );

    expect(screen.getByText('Descuentos para:')).toBeInTheDocument();
    expect(screen.getByText('Plan Premium, Plan Gold')).toBeInTheDocument();
  });

  it('debe llamar a onClick con el id del restaurante al hacer click en la tarjeta', () => {
    const handleClick = vi.fn();

    render(<RestaurantCard {...defaultProps} onClick={handleClick} />);

    // Hacemos click en la imagen (siempre está presente en la card)
    fireEvent.click(screen.getByAltText('La Trattoria del Sur'));

    expect(handleClick).toHaveBeenCalledWith('rest-001');
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('debe renderizar la imagen con la URL correcta cuando se proporciona imagen', () => {
    render(<RestaurantCard {...defaultProps} />);

    const img = screen.getByAltText('La Trattoria del Sur') as HTMLImageElement;

    // La URL de la imagen debe combinar API_BASE_URL + la ruta de la imagen
    expect(img.src).toBe('http://test-server/uploads/trattoria.jpg');
  });
});
