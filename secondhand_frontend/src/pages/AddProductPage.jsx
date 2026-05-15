import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  products as productsApi,
  categories as categoriesApi,
} from '../services/index';

export default function AddProductPage() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [images, setImages] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'AZN',
    category: '',
    condition: 'good',
    location: 'Baku',
    contact_phone: '',
  });

  useEffect(() => {
    categoriesApi.list()
      .then(data => {
        const categoryList = Array.isArray(data)
          ? data
          : data.results || [];

        setCategories(categoryList);

        if (categoryList.length > 0) {
          setForm(prev => ({
            ...prev,
            category: String(categoryList[0].id),
          }));
        }
      })
      .catch(err => {
        console.error('CATEGORY ERROR:', err);
        setCategories([]);
      });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => {
      formData.append(key, value);
    });

    images.forEach(image => {
      formData.append('images', image);
    });

    try {
      await productsApi.create(formData);
      navigate('/');
    } catch (err) {
      console.error(err);
      alert('Product could not be added');
    }
  };

  return (
    <div className="page add-page-modern">

      <div className="add-hero-card">
        <div>
          <span className="add-badge">
            Seller dashboard
          </span>

          <h1>Add New Listing</h1>

          <p>
            Publish your item and reach buyers across Baku.
          </p>
        </div>

        <div className="add-hero-icon">
          🛍️
        </div>
      </div>

      <div className="add-form-card">

        <form onSubmit={handleSubmit}>

          <div className="add-grid">

            <div className="form-group full">
              <label className="form-label">
                Title
              </label>

              <input
                className="form-input"
                value={form.title}
                onChange={e =>
                  setForm({
                    ...form,
                    title: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group full">
              <label className="form-label">
                Description
              </label>

              <textarea
                className="form-input form-textarea"
                value={form.description}
                onChange={e =>
                  setForm({
                    ...form,
                    description: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Price
              </label>

              <input
                className="form-input"
                type="number"
                value={form.price}
                onChange={e =>
                  setForm({
                    ...form,
                    price: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Currency
              </label>

              <select
                className="form-input"
                value={form.currency}
                onChange={e =>
                  setForm({
                    ...form,
                    currency: e.target.value
                  })
                }
              >
                <option value="AZN">AZN</option>
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Category
              </label>

              <select
                className="form-input"
                value={form.category}
                onChange={e =>
                  setForm({
                    ...form,
                    category: e.target.value
                  })
                }
              >
                {categories.map(category => (
                  <option
                    key={category.id}
                    value={category.id}
                  >
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Condition
              </label>

              <select
                className="form-input"
                value={form.condition}
                onChange={e =>
                  setForm({
                    ...form,
                    condition: e.target.value
                  })
                }
              >
                <option value="new">New</option>
                <option value="like_new">Like new</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Location
              </label>

              <input
                className="form-input"
                value={form.location}
                onChange={e =>
                  setForm({
                    ...form,
                    location: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Contact phone
              </label>

              <input
                className="form-input"
                value={form.contact_phone}
                onChange={e =>
                  setForm({
                    ...form,
                    contact_phone: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group full">
              <label className="form-label">
                Upload images
              </label>

              <div className="upload-box">
                <div className="upload-icon">
                  📸
                </div>

                <p>
                  Drag images here or choose files
                </p>

                <span>
                  PNG, JPG up to 5 images
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={e =>
                    setImages(
                      Array.from(e.target.files).slice(0, 5)
                    )
                  }
                />
              </div>

              {images.length > 0 && (
                <div className="selected-images">
                  {images.map((img, index) => (
                    <div
                      key={index}
                      className="selected-image-pill"
                    >
                      {img.name}
                    </div>
                  ))}
                </div>
              )}

            </div>

          </div>

          <button
            className="btn-block add-submit-btn"
            type="submit"
          >
            Publish Listing
          </button>

        </form>

      </div>

    </div>
  );
}