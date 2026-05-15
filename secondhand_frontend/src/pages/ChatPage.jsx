import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

const BASE_URL = 'http://127.0.0.1:8000';

export default function ChatPage() {
  const { conversationId } = useParams();

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const token = localStorage.getItem('access_token');
  const currentUsername = localStorage.getItem('username') || 'neoysf';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await fetch(
        `${BASE_URL}/api/messaging/${conversationId}/messages/`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      setMessages(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  loadMessages();

  const readChats =
    JSON.parse(localStorage.getItem('read_chats') || '[]');

  if (!readChats.includes(Number(conversationId))) {
    readChats.push(Number(conversationId));

    localStorage.setItem(
      'read_chats',
      JSON.stringify(readChats)
    );
  }

  const interval = setInterval(() => {
    loadMessages();
  }, 2000);

  return () => clearInterval(interval);
}, [conversationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      setSending(true);

      const response = await fetch(
        `${BASE_URL}/api/messaging/${conversationId}/messages/`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ content }),
        }
      );

      if (response.ok) {
        setContent('');
        loadMessages();
      } else {
        alert('Message could not be sent');
      }
    } catch (error) {
      console.error(error);
      alert('Something went wrong');
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(e);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="chat-loading">
          <div className="chat-loading-spinner" />
          <p>Loading chat...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        /* ── Chat Page Layout ── */
        .chat-page-wrapper {
          display: flex;
          flex-direction: column;
          height: calc(100vh - 64px); /* adjust if your navbar is different */
          max-width: 780px;
          margin: 0 auto;
          padding: 24px 16px 0;
          box-sizing: border-box;
        }

        /* ── Header ── */
        .chat-header-bar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
          flex-shrink: 0;
        }

        .chat-header-bar h1 {
          font-size: 1.45rem;
          font-weight: 700;
          color: var(--color-text, #1a1a1a);
          margin: 0 0 2px;
          letter-spacing: -0.02em;
        }

        .chat-header-bar p {
          font-size: 0.82rem;
          color: var(--color-muted, #888);
          margin: 0;
        }

        .chat-back-btn {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 0.82rem;
          font-weight: 600;
          color: var(--color-primary, #2563eb);
          text-decoration: none;
          padding: 7px 14px;
          border: 1.5px solid var(--color-primary, #2563eb);
          border-radius: 20px;
          transition: background 0.18s, color 0.18s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .chat-back-btn:hover {
          background: var(--color-primary, #2563eb);
          color: #fff;
        }

        /* ── Card Shell ── */
        .chat-card-shell {
          display: flex;
          flex-direction: column;
          flex: 1;
          background: var(--color-surface, #fff);
          border: 1px solid var(--color-border, #e5e7eb);
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 32px rgba(0,0,0,0.06);
          margin-bottom: 24px;
        }

        /* ── Messages Scroll Area ── */
        .chat-messages-area {
          flex: 1;
          overflow-y: auto;
          padding: 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
          scroll-behavior: smooth;
        }

        .chat-messages-area::-webkit-scrollbar {
          width: 5px;
        }
        .chat-messages-area::-webkit-scrollbar-track {
          background: transparent;
        }
        .chat-messages-area::-webkit-scrollbar-thumb {
          background: var(--color-border, #e5e7eb);
          border-radius: 10px;
        }

        /* ── Empty State ── */
        .chat-empty-state {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 40px 20px;
          color: var(--color-muted, #888);
        }

        .chat-empty-icon {
          font-size: 2.8rem;
          margin-bottom: 14px;
          opacity: 0.5;
        }

        .chat-empty-state h3 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 6px;
          color: var(--color-text, #1a1a1a);
        }

        .chat-empty-state p {
          font-size: 0.83rem;
          margin: 0;
        }

        /* ── Message Rows ── */
        .msg-row {
          display: flex;
          align-items: flex-end;
          gap: 8px;
          animation: msgFadeIn 0.22s ease both;
        }

        @keyframes msgFadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .msg-row.mine {
          flex-direction: row-reverse;
        }

        /* Avatar */
        .msg-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: var(--color-primary, #2563eb);
          color: #fff;
          font-size: 0.7rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          text-transform: uppercase;
        }

        .msg-row.mine .msg-avatar {
          background: var(--color-accent, #10b981);
        }

        .msg-row.theirs .msg-avatar {
          background: var(--color-primary, #2563eb);
        }

        /* Bubble */
        .msg-bubble-wrap {
          display: flex;
          flex-direction: column;
          max-width: 68%;
          gap: 3px;
        }

        .msg-row.mine .msg-bubble-wrap {
          align-items: flex-end;
        }

        .msg-row.theirs .msg-bubble-wrap {
          align-items: flex-start;
        }

        .msg-sender {
          font-size: 0.72rem;
          font-weight: 600;
          color: var(--color-muted, #888);
          padding: 0 4px;
          letter-spacing: 0.01em;
        }

        .msg-bubble {
          padding: 10px 14px;
          border-radius: 18px;
          font-size: 0.88rem;
          line-height: 1.5;
          word-break: break-word;
        }

        .msg-row.mine .msg-bubble {
          background: var(--color-primary, #2563eb);
          color: #fff;
          border-bottom-right-radius: 5px;
        }

        .msg-row.theirs .msg-bubble {
          background: var(--color-bg-muted, #f3f4f6);
          color: var(--color-text, #1a1a1a);
          border-bottom-left-radius: 5px;
        }

        .msg-time {
          font-size: 0.67rem;
          color: var(--color-muted, #aaa);
          padding: 0 4px;
        }

        /* ── Divider between dates (optional visual) ── */
        .msg-date-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 8px 0;
        }

        .msg-date-divider::before,
        .msg-date-divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: var(--color-border, #e5e7eb);
        }

        .msg-date-divider span {
          font-size: 0.7rem;
          font-weight: 600;
          color: var(--color-muted, #aaa);
          white-space: nowrap;
          letter-spacing: 0.04em;
          text-transform: uppercase;
        }

        /* ── Input Bar ── */
        .chat-input-bar {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px 16px;
          border-top: 1px solid var(--color-border, #e5e7eb);
          background: var(--color-surface, #fff);
          flex-shrink: 0;
        }

        .chat-input-field {
          flex: 1;
          resize: none;
          border: 1.5px solid var(--color-border, #e5e7eb);
          border-radius: 22px;
          padding: 10px 16px;
          font-size: 0.88rem;
          font-family: inherit;
          line-height: 1.4;
          outline: none;
          background: var(--color-bg-muted, #f9fafb);
          color: var(--color-text, #1a1a1a);
          transition: border-color 0.18s, background 0.18s;
          max-height: 100px;
          overflow-y: auto;
        }

        .chat-input-field:focus {
          border-color: var(--color-primary, #2563eb);
          background: var(--color-surface, #fff);
        }

        .chat-input-field::placeholder {
          color: var(--color-muted, #aaa);
        }

        .chat-send-btn {
          width: 42px;
          height: 42px;
          border-radius: 50%;
          border: none;
          background: var(--color-primary, #2563eb);
          color: #fff;
          font-size: 1.1rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          flex-shrink: 0;
          transition: background 0.18s, transform 0.14s;
        }

        .chat-send-btn:hover:not(:disabled) {
          background: var(--color-primary-dark, #1d4ed8);
          transform: scale(1.06);
        }

        .chat-send-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* ── Loading ── */
        .chat-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 14px;
          padding: 80px 20px;
          color: var(--color-muted, #888);
          font-size: 0.88rem;
        }

        .chat-loading-spinner {
          width: 32px;
          height: 32px;
          border: 3px solid var(--color-border, #e5e7eb);
          border-top-color: var(--color-primary, #2563eb);
          border-radius: 50%;
          animation: spin 0.75s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        /* ── Responsive ── */
        @media (max-width: 600px) {
          .chat-page-wrapper {
            padding: 16px 8px 0;
          }
          .chat-header-bar h1 {
            font-size: 1.15rem;
          }
          .msg-bubble-wrap {
            max-width: 82%;
          }
        }
      `}</style>

      <div className="chat-page-wrapper">

        {/* Header */}
        <div className="chat-header-bar">
          <div>
            <h1>Messages</h1>
            <p>Continue your conversation with the seller or buyer.</p>
          </div>
          <Link to="/messages" className="chat-back-btn">
            ← Back
          </Link>
        </div>

        {/* Card Shell */}
        <div className="chat-card-shell">

          {/* Messages Area */}
          <div className="chat-messages-area">
            {messages.length === 0 ? (
              <div className="chat-empty-state">
                <div className="chat-empty-icon">💬</div>
                <h3>No messages yet</h3>
                <p>Start the conversation by sending a message.</p>
              </div>
            ) : (
              messages.map((msg, i) => {
                const isMine = msg.sender === currentUsername;

                // Date divider logic
                const msgDate = new Date(msg.sent_at).toLocaleDateString();
                const prevDate = i > 0
                  ? new Date(messages[i - 1].sent_at).toLocaleDateString()
                  : null;
                const showDivider = i === 0 || msgDate !== prevDate;

                const avatarLabel = (msg.sender || '?').slice(0, 2);

                return (
                  <div key={msg.id}>
                    {showDivider && (
                      <div className="msg-date-divider">
                        <span>{msgDate}</span>
                      </div>
                    )}

                    <div className={`msg-row ${isMine ? 'mine' : 'theirs'}`}>
                      <div className="msg-avatar">{avatarLabel}</div>
                      <div className="msg-bubble-wrap">
                        <span className="msg-sender">{msg.sender}</span>
                        <div className="msg-bubble">{msg.content}</div>
                        <span className="msg-time">
                          {new Date(msg.sent_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="chat-input-bar">
            <textarea
              className="chat-input-field"
              rows={1}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a message… (Enter to send)"
            />
            <button
              className="chat-send-btn"
              onClick={sendMessage}
              disabled={sending || !content.trim()}
              title="Send"
            >
              {sending ? '…' : '↑'}
            </button>
          </div>

        </div>

      </div>
    </>
  );
}