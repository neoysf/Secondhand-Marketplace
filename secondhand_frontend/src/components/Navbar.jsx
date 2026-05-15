import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const BASE_URL = 'http://127.0.0.1:8000';

export default function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [search, setSearch] = useState('');
  const [chatCount, setChatCount] = useState(0);

  const loadChatCount = () => {
    const token =
      localStorage.getItem('access_token') ||
      localStorage.getItem('access');

    if (!token || token === 'undefined' || token === 'null') {
      setChatCount(0);
      return;
    }

    if (!token || !user) {
      setChatCount(0);
      return;
    }

    fetch(`${BASE_URL}/api/messaging/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const readChats = JSON.parse(
            localStorage.getItem('read_chats') || '[]'
          );

          const unreadChats = data.filter(
            conv => !readChats.includes(conv.conversation_id)
          );

          setChatCount(unreadChats.length);
        } else {
          setChatCount(0);
        }
      })
      .catch(() => setChatCount(0));
  };

  useEffect(() => {
    loadChatCount();

    const interval = setInterval(loadChatCount, 2000);

    return () => clearInterval(interval);
  }, [user]);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/?search=${encodeURIComponent(search.trim())}`);
  };

  const handleLogout = () => {
    logout();
    setChatCount(0);
    localStorage.removeItem('read_chats');
    navigate('/');
  };

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        <span
          className="navbar-logo"
          onClick={() => navigate('/')}
          style={{ cursor: 'pointer' }}
        >
          second·hand
        </span>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </form>

        <div className="navbar-links">
          {user ? (
            <>
              <span
                className="nav-link chat-nav-link"
                onClick={() => navigate('/messages')}
                style={{ cursor: 'pointer' }}
              >
                Chat

                {chatCount > 0 && (
                  <span className="chat-badge">
                    {chatCount}
                  </span>
                )}
              </span>
              
              <span
                className="nav-link"
                onClick={() => navigate('/favorites')}
                style={{ cursor: 'pointer' }}
              >
                Favorites
              </span>

              <span
                className="nav-link"
                onClick={() => navigate('/add-product')}
                style={{ cursor: 'pointer' }}
              >
                + Add listing
              </span>

              <span
                className="nav-link"
                onClick={() => navigate('/profile')}
                style={{ cursor: 'pointer' }}
              >
                {user.first_name || user.username}
              </span>

              <button className="btn-outline" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <button
              type="button"
              className="btn-outline"
              onClick={() => navigate('/login')}
            >
              Sign in
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}