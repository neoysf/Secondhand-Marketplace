import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { products as productsApi } from '../services/index';

const BASE_URL = 'http://127.0.0.1:8000';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [contactLoading, setContactLoading] = useState(false);
  const [favourited, setFavourited] = useState(false);

  const getAuthToken = () => {
    return (
      localStorage.getItem('access_token') ||
      localStorage.getItem('access')
    );
  };

  useEffect(() => {
    productsApi.get(id)
      .then(data => setProduct(data))
      .catch(err => console.error(err))
      .finally(() => setLoading(false));

    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access');

    if (token) {
      fetch(`${BASE_URL}/api/listings/favourites/`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const exists = data.some(item => Number(item.id) === Number(id));
            setFavourited(exists);
          }
        })
        .catch(err => console.error(err));
    }
  }, [id]);

  const handleFavourite = async () => {
    const token = getAuthToken();

    if (!token) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    try {
      const response = await fetch(
        `${BASE_URL}/api/listings/${id}/favourite/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || data.detail || 'Could not save item');
        return;
      }

      setFavourited(prev => !prev);
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    }
  };

  const handleContactSeller = async () => {
    const token = getAuthToken();

    if (!token) {
      alert('Please login first');
      navigate('/login');
      return;
    }

    try {
      setContactLoading(true);

      const response = await fetch(`${BASE_URL}/api/messaging/${id}/start/`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || data.detail || 'Could not start conversation');
        return;
      }

      navigate(`/messages/${data.conversation_id}`);
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    } finally {
      setContactLoading(false);
    }
  };

  if (loading) return <div className="page">Loading...</div>;
  if (!product) return <div className="page">Product not found</div>;

  return (
    <div className="page">
      <div className="product-detail">
        <div className="product-detail-images">
          {product.images && product.images.length > 0 ? (
            product.images.map((img, index) => {
              const imageUrl = img.image?.startsWith('http')
                ? img.image
                : `${BASE_URL}${img.image}`;

              return (
                <img
                  key={index}
                  src={imageUrl}
                  alt={product.title}
                />
              );
            })
          ) : (
            <div className="product-detail-placeholder">📦</div>
          )}
        </div>

        <div className="product-detail-info">
          <h1>{product.title}</h1>

          <p className="product-card-location">
            📍 {product.location || 'Baku'}
          </p>

          <h2>
            {Number(product.price).toLocaleString()} {product.currency || 'AZN'}
          </h2>

          <p><b>Condition:</b> {product.condition}</p>
          <p><b>Category:</b> {product.category_name}</p>

          {product.contact_phone && (
            <p><b>Contact:</b> {product.contact_phone}</p>
          )}

          <p>{product.description}</p>

          <button
            onClick={handleFavourite}
            className="favourite-btn"
          >
            {favourited ? '❤️ Saved' : '🤍 Save'}
          </button>

          <button
            onClick={handleContactSeller}
            disabled={contactLoading}
            className="contact-btn"
          >
            {contactLoading ? 'Opening chat...' : 'Contact'}
          </button>
        </div>
      </div>
    </div>
  );
}