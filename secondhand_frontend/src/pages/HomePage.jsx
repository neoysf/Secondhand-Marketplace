import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { products as productsApi } from "../services/index";
import ProductCard from '../components/ProductCard';

const CATEGORIES = [
  'All',
  'Electronics',
  'Clothing',
  'Home & Garden',
  'Vehicles',
  'Sports',
  'Books',
  'Other',
];

export default function HomePage() {

  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const searchQuery =
    (searchParams.get('search') || '').trim();

  const [items, setItems] = useState([]);
  const [activeCategory, setActiveCategory] = useState('All');

  useEffect(() => {

    productsApi.list({})
      .then(data => {

        const allItems = Array.isArray(data)
          ? data
          : data.results || [];

        const filteredItems = allItems.filter(item => {

          const matchesCategory =
            activeCategory === 'All' ||
            item.category_name?.toLowerCase() ===
            activeCategory.toLowerCase();

          const matchesSearch =
            searchQuery === '' ||
            item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.location?.toLowerCase().includes(searchQuery.toLowerCase());

          return matchesCategory && matchesSearch;

        });

        setItems(filteredItems);

      })
      .catch(error => {

        console.error("API ERROR:", error);
        setItems([]);

      });

  }, [activeCategory, searchQuery]);

  return (
    <>

      {!searchQuery && (

        <div className="hero hero-modern">

          <div className="hero-modern-inner">

            <div className="hero-content">

              <span className="hero-badge">
                Trusted local marketplace
              </span>

              <h1>
                Second-Hand Goods
                <br />
                Find a New Home
              </h1>

              <p>
                Buy and sell quality second-hand items in Baku.
                Discover electronics, books, clothing,
                furniture and more from real local sellers.
              </p>

              <div className="hero-actions">

                <button
                  className="btn-light"
                  onClick={() =>
                    document
                      .getElementById('latest-listings')
                      ?.scrollIntoView({
                        behavior: 'smooth'
                      })
                  }
                >
                  Browse Listings
                </button>

              </div>

              <div className="hero-stats">

                <div>
                  <strong>100+</strong>
                  <span>Listings</span>
                </div>

                <div>
                  <strong>7</strong>
                  <span>Categories</span>
                </div>

                <div>
                  <strong>Baku</strong>
                  <span>Local sellers</span>
                </div>

              </div>

            </div>

            <div className="hero-preview">

              <div className="preview-floating-card card-one">

                <span>💻</span>

                <div>
                  <b>MacBook Air M1</b>
                  <p>1,349 AZN</p>
                </div>

              </div>

              <div className="preview-floating-card card-two">

                <span>📚</span>

                <div>
                  <b>Classic Novel</b>
                  <p>12 AZN</p>
                </div>

              </div>

              <div className="hero-phone-card">

                <div className="phone-top"></div>

                <div className="phone-image">
                  🛍️
                </div>

                <div className="phone-lines">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>

              </div>

            </div>

          </div>

        </div>

      )}

      <div className="page">

        <div className="filters-bar">

          {CATEGORIES.map(cat => (

            <button
              key={cat}
              className={`filter-chip ${
                activeCategory === cat ? 'active' : ''
              }`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
            </button>

          ))}

        </div>

        <h2
          id="latest-listings"
          className="section-title"
        >

          {searchQuery
            ? `Search results for "${searchQuery}"`
            : 'Latest Listings'}

        </h2>

        {items.length === 0 ? (

          <div className="empty-state">

            <div className="empty-state-icon">
              📭
            </div>

            <div className="empty-state-title">
              No listings found
            </div>

            <div className="empty-state-text">
              Try another search or category.
            </div>

          </div>

        ) : (

          <div className="products-grid">

            {items.map(p => (

              <ProductCard
                key={p.id}
                product={p}
                onClick={() =>
                  navigate(`/products/${p.id}`)
                }
              />

            ))}

          </div>

        )}

      </div>

    </>
  );
}