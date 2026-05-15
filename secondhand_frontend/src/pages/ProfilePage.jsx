import { useEffect, useState } from 'react';
import { auth as authApi } from '../services/index';

export default function ProfilePage() {

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [avatar, setAvatar] = useState(null);

  const [form, setForm] = useState({
    username: '',
    role: 'buyer',
    email: '',
    phone: '',
    location: '',
    bio: '',
    avatar: '',
  });

  useEffect(() => {
    authApi.me()
      .then(data => {
        setForm({
          username: data.username || '',
          role: data.role || 'buyer',
          email: data.email || '',
          phone: data.phone || '',
          location: data.location || '',
          bio: data.bio || '',
          avatar: data.avatar || '',
        });
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setSaving(true);

    try {

      const formData = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key !== 'avatar') {
          formData.append(key, value);
        }
      });

      if (avatar) {
        formData.append('avatar', avatar);
      }

      await authApi.updateProfile(formData);

      alert('Profile updated successfully');

      window.location.reload();

    } catch (err) {
      console.error(err);
      alert('Profile update failed');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="page">Loading...</div>;
  }

  return (
    <div className="page profile-page-modern">

      <div className="profile-hero-card">

        <div className="profile-avatar-big">

          {form.avatar ? (
            <img
              src={`http://127.0.0.1:8000${form.avatar}`}
              alt="avatar"
              className="profile-avatar-image"
            />
          ) : (
            form.username?.charAt(0)?.toUpperCase()
          )}

        </div>

        <div>
          <h1>{form.username}</h1>

          <p>{form.email}</p>

          <span className="profile-role-pill">
            {form.role}
          </span>
        </div>

      </div>

      <div className="profile-edit-card">

        <h2>Edit Profile</h2>

        <p className="profile-subtitle">
          Keep your marketplace profile updated so buyers and sellers can reach you easily.
        </p>

        <form onSubmit={handleSubmit}>

          <div className="profile-grid">

            <div className="form-group">
              <label className="form-label">
                Username
              </label>

              <input
                className="form-input"
                value={form.username}
                onChange={e =>
                  setForm({
                    ...form,
                    username: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Email
              </label>

              <input
                className="form-input"
                value={form.email}
                disabled
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Role
              </label>

              <select
                className="form-input"
                value={form.role}
                onChange={e =>
                  setForm({
                    ...form,
                    role: e.target.value
                  })
                }
              >
                <option value="buyer">
                  Buyer
                </option>

                <option value="seller">
                  Seller
                </option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Phone
              </label>

              <input
                className="form-input"
                value={form.phone}
                onChange={e =>
                  setForm({
                    ...form,
                    phone: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group full">
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

            <div className="form-group full">
              <label className="form-label">
                Bio
              </label>

              <textarea
                className="form-input form-textarea"
                rows="5"
                value={form.bio}
                onChange={e =>
                  setForm({
                    ...form,
                    bio: e.target.value
                  })
                }
              />
            </div>

            <div className="form-group full">
              <label className="form-label">
                Profile Photo
              </label>

              <input
                className="form-input"
                type="file"
                accept="image/*"
                onChange={e => setAvatar(e.target.files[0])}
              />
            </div>

          </div>

          <button
            className="btn-block"
            type="submit"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>

        </form>

      </div>

    </div>
  );
}