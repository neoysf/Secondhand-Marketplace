const CONDITION_LABELS = {
  new: 'New',
  like_new: 'Like new',
  good: 'Good',
  fair: 'Fair',
  poor: 'Worn',
};

export default function ProductCard({ product, onClick }) {
  const imageUrl =
    product.images && product.images.length > 0
      ? `http://127.0.0.1:8000${product.images[0].image}`
      : null;

  return (
    <div className="product-card" onClick={onClick}>
      <div className="product-card-img">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
        ) : (
          '📦'
        )}
      </div>

      <div className="product-card-body">
        <div className="product-card-title">{product.title}</div>

        <div className="product-card-location">
          📍 {product.location || 'Baku'}
        </div>

        <div className="product-card-price">
          {Number(product.price).toLocaleString()} {product.currency || 'AZN'}
        </div>

        {product.condition && (
          <span className="badge">
            {CONDITION_LABELS[product.condition] || product.condition}
          </span>
        )}
      </div>
    </div>
  );
}