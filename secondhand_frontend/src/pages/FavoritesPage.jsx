import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BASE_URL = 'http://127.0.0.1:8000';

export default function FavoritesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access');

    fetch(`${BASE_URL}/api/listings/favourites/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('FAVOURITES:', data);

        if (Array.isArray(data)) {
          setItems(data);
        } else {
          setItems([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div className="page">Loading favorites...</div>;
  }

  return (
    <div className="page">
      <div className="favorites-page">
        <div className="favorites-header">
          <h1>Favorites</h1>
          <p>Your saved second-hand products.</p>
        </div>

        {items.length === 0 ? (
          <div className="empty-messages">
            <h3>No favorites yet</h3>
            <p>Saved products will appear here.</p>
          </div>
        ) : (
          <div className="favorites-grid">
            {items.map(item => {
              const imageUrl = item.image
                ? `${BASE_URL}${item.image}`
                : null;

              return (
                <Link
                  key={item.id}
                  to={`/products/${item.id}`}
                  className="product-card"
                  style={{ textDecoration: 'none' }}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className="product-card-image"
                    />
                  ) : (
                    <div className="product-placeholder">📦</div>
                  )}

                  <div className="product-card-content">
                    <h3 className="product-card-title">
                      {item.title}
                    </h3>

                    <p className="product-card-location">
                      📍 {item.location || 'Baku'}
                    </p>

                    <h4 className="product-card-price">
                      {Number(item.price).toLocaleString()} {item.currency || 'AZN'}
                    </h4>

                    <span className="product-condition">
                      {item.condition}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}