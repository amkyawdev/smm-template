# SMM Service Website

A complete social media marketing (SMM) service website with admin panel, built with HTML5, CSS3, JavaScript, and Python backend.

## Features

### Pages
- **Home Page (main.html)** - Landing page with hero section, services, testimonials, and stats
- **Get Started (index.html)** - Step-by-step guide, pricing cards, and FAQ
- **About Us (about.html)** - Company information, mission, vision, and values
- **Contact (contact.html)** - Contact form and information
- **Admin Panel (admin.html)** - Complete dashboard for managing the website

### Admin Features
- Dashboard with stats and charts
- Service management (CRUD operations)
- Order tracking and management
- Site settings configuration
- Admin credentials management

### Technical Features
- Three.js flame particle animation background
- Responsive design (mobile, tablet, desktop)
- API backend with Neon PostgreSQL database
- Chart.js for analytics visualization
- Smooth scroll and animations
- Touch-friendly interactions

## Tech Stack

### Frontend
- HTML5 / CSS3
- JavaScript (ES6+)
- Bootstrap 5.3
- Bootstrap Icons
- Three.js r128
- Chart.js

### Backend
- Python 3.9
- PostgreSQL (Neon DB)
- psycopg2

### Deployment
- Vercel

## Project Structure

```
smm-service-website/
├── css/
│   ├── style.css          # Main website styles
│   ├── admin.css          # Admin panel styles
│   └── pages.css          # Page-specific styles
├── js/
│   ├── main.js            # Home page functionality
│   ├── admin.js           # Admin panel functionality
│   ├── pages.js           # Pages functionality
│   └── three-flames.js    # Three.js animation
├── server/
│   └── neondb.py          # API backend
├── assets/
│   ├── images/
│   └── icons/
├── index.html              # Get Started page
├── main.html               # Home page
├── admin.html              # Admin panel
├── about.html              # About page
├── contact.html            # Contact page
├── vercel.json             # Vercel config
├── requirements.txt        # Python dependencies
└── .gitignore
```

## Installation

### Local Development

1. Clone the repository:
```bash
git clone https://github.com/amkyawdev/smm-template.git
cd smm-template
```

2. Install Python dependencies:
```bash
pip install -r requirements.txt
```

3. Run locally with Vercel CLI:
```bash
npm install -g vercel
vercel dev
```

### Deployment to Vercel

1. Push to GitHub
2. Connect repository to Vercel
3. Add environment variable:
   - `NEON_DATABASE_URL` - Your Neon PostgreSQL connection string
4. Deploy!

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEON_DATABASE_URL` | PostgreSQL connection string from Neon DB |

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/settings` | Get site settings |
| POST | `/api/settings` | Update settings |
| GET | `/api/services` | Get all services |
| GET | `/api/services/:id` | Get single service |
| POST | `/api/services` | Create service |
| POST | `/api/services/:id` | Update service |
| DELETE | `/api/services/:id` | Delete service |
| GET | `/api/orders` | Get all orders |
| POST | `/api/orders` | Create order |
| GET | `/api/admin` | Get admin info |
| POST | `/api/admin` | Update admin credentials |

## Default Admin Login

- Username: `admin`
- Password: `admin123`

⚠️ **Important:** Change the default admin password after first login!

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
- Opera 76+
- iOS Safari 14+
- Android Chrome 90+

## License

MIT License

## Support

For questions or support, contact via Telegram or email.