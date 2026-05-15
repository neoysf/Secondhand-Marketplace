import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import AuthPage from './pages/AuthPage'
import ProductDetailPage from './pages/ProductDetailPage'
import AddProductPage from './pages/AddProductPage'
import ProfilePage from './pages/ProfilePage';
import MessagesPage from './pages/MessagesPage'
import ChatPage from './pages/ChatPage'
import FavoritesPage from './pages/FavoritesPage'
import './main.css'

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/login"
              element={<AuthPage key="login" initialTab="login" />}
            />
            <Route
              path="/register"
              element={<AuthPage key="register" initialTab="register" />}
            />
            <Route path="/messages" element={<MessagesPage />} />
            <Route path="/messages/:conversationId" element={<ChatPage />} />
            <Route path="/products/:id" element={<ProductDetailPage />} />
            <Route path="/add-product" element={<AddProductPage />} />
            <Route path="/favorites" element={<FavoritesPage />} />
            <Route path="/profile" element={<ProfilePage />} />
          </Routes>
        </BrowserRouter>
      </ToastProvider>
    </AuthProvider>
  )
}

export default App