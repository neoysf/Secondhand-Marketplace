import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const BASE_URL = 'http://127.0.0.1:8000';

export default function MessagesPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadConversations = () => {
    const token = localStorage.getItem('access_token');

    fetch(`${BASE_URL}/api/messaging/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    })
      .then(res => res.json())
      .then(data => {
        console.log('MESSAGES DATA:', data);

        if (Array.isArray(data)) {
          setConversations(data);
        } else {
          setConversations([]);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadConversations();

    const interval = setInterval(() => {
      loadConversations();
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="page">Loading messages...</div>;
  }

  return (
    <div className="page">
      <div className="messages-page">
        <div className="messages-header">
          <h1>Messages</h1>
          <p>View conversations with buyers and sellers.</p>
        </div>

        {conversations.length === 0 ? (
          <div className="empty-messages">
            <h3>No conversations yet</h3>
            <p>When you message a seller, your chats will appear here.</p>
          </div>
        ) : (
          <div className="messages-grid">
            {conversations.map(conv => (
              <Link
                key={conv.conversation_id}
                to={`/messages/${conv.conversation_id}`}
                className="message-card"
              >
                <h3>{conv.listing}</h3>

                <div className="message-meta">
                  <span><b>Buyer:</b> {conv.buyer}</span>
                  <span><b>Seller:</b> {conv.seller}</span>
                </div>

                <p className="message-preview">
                  {conv.last_message || 'No messages yet'}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}