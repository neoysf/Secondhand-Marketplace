# Secondhand Marketplace

Secondhand Marketplace is a modern full-stack web application where users can buy, sell, and explore secondhand products in a secure and user-friendly environment. The platform simplifies the process of listing products, browsing categories, contacting sellers, and managing user activities through a clean and responsive interface.

---

## Features

- User authentication & authorization
- Product listing and management
- Favorites system
- Advanced product search & filtering
- Seller contact functionality
- Personalized user profiles
- Responsive modern UI/UX
- Secure REST API integration
- Category-based product browsing
- Real-time user experience

---

## Categories

- Electronics
- Fashion
- Home & Living
- Books
- Vehicles
- Sports
- Beauty
- Accessories

---

## Tech Stack

### Frontend
- React
- JavaScript
- Tailwind CSS
- React Router
- Axios

### Backend
- Django
- Django REST Framework
- SQLite / PostgreSQL
- JWT Authentication

---

## Installation

### Clone the repository

```bash
git clone https://github.com/yourusername/secondhand-marketplace.git
cd secondhand-marketplace
```

---

# Backend Setup

### Create virtual environment

```bash
python -m venv venv
```

### Activate virtual environment

#### Windows

```bash
venv\Scripts\activate
```

#### macOS/Linux

```bash
source venv/bin/activate
```

### Install dependencies

```bash
pip install -r requirements.txt
```

### Run migrations

```bash
python manage.py migrate
```

### Start backend server

```bash
python manage.py runserver
```

---

# Frontend Setup

### Install dependencies

```bash
npm install
```

### Start development server

```bash
npm run dev
```

---

## Main Functionalities

### Authentication
- Register & login system
- JWT token authentication
- Protected routes

### Marketplace
- Create product listings
- Edit and delete products
- Browse products by categories
- Search and filter products

### User Features
- Add products to favorites
- Contact sellers
- Manage personal profile
- View personal listings

---

## Project Structure

```bash
Secondhand-Marketplace/
│
├── backend/
├── frontend/
├── media/
├── public/
└── README.md
```

---

## API Endpoints

### Authentication
- `POST /api/register/`
- `POST /api/login/`
- `GET /api/profile/`

### Listings
- `GET /api/listings/`
- `POST /api/listings/create/`
- `PATCH /api/listings/:id/`
- `DELETE /api/listings/:id/`

### Favorites
- `GET /api/listings/favourites/`
- `POST /api/listings/:id/favourite/`

---

## Future Improvements

- Real-time chat system
- Payment integration
- AI-powered recommendations
- Mobile application
- Multi-language support
- Admin dashboard

---

## Screenshots

Add project screenshots here.

---

## Author

Narmin Yusifova

GitHub: https://github.com/neoysf

---

## License

This project was developed for educational and portfolio purposes.
