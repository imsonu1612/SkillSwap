# SkillSwap - Connect & Learn Skills

A modern web platform where users can connect, learn, and share skills with each other. Built with Node.js, Express, MongoDB, and React.

## 🌟 Features

- **User Authentication**: Secure login and registration with JWT tokens
- **Profile Management**: Edit profile information and manage skills
- **Skill Sharing**: Add skills with different proficiency levels
- **User Discovery**: Search and find users by skills and location
- **Modern UI**: Beautiful, responsive design with Tailwind CSS
- **Real-time Updates**: Live notifications and updates
- **Mobile Responsive**: Works perfectly on all devices

## 🚀 Quick Start

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd SkillSwapWebsite
   ```

2. **Install dependencies**
   ```bash
   # Install backend dependencies
   npm install
   
   # Install frontend dependencies
   cd client
   npm install
   cd ..
   ```

3. **Environment Setup**
   ```bash
   # Copy environment example
   cp env.example .env
   
   # Edit .env file with your configuration
   nano .env
   ```

4. **Configure MongoDB**
   - For local MongoDB: `MONGODB_URI=mongodb://localhost:27017/skillswap`
   - For MongoDB Atlas: `MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/skillswap`

5. **Start the application**
   ```bash
   # Development mode (runs both frontend and backend)
   npm run dev
   
   # Or run separately:
   # Backend only
   npm run server
   
   # Frontend only
   cd client && npm start
   ```

6. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
SkillSwapWebsite/
├── server/
│   ├── index.js          # Main server file
│   ├── models/
│   │   └── User.js       # User model
│   └── routes/
│       ├── auth.js        # Authentication routes
│       └── users.js       # User management routes
├── client/
│   ├── public/
│   │   └── index.html     # Main HTML file
│   ├── src/
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   ├── Login.js
│   │   │   │   └── Register.js
│   │   │   ├── dashboard/
│   │   │   │   └── Dashboard.js
│   │   │   ├── profile/
│   │   │   │   └── Profile.js
│   │   │   ├── search/
│   │   │   │   └── SearchUsers.js
│   │   │   └── layout/
│   │   │       └── Navbar.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   ├── App.js
│   │   ├── index.js
│   │   └── index.css
│   ├── package.json
│   ├── tailwind.config.js
│   └── postcss.config.js
├── package.json
├── env.example
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/skillswap

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
CLIENT_URL=http://localhost:3000

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

## 🛠️ API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile
- `POST /api/users/skills` - Add skill to profile
- `DELETE /api/users/skills/:skillId` - Remove skill from profile
- `GET /api/users/search` - Search users by skills/location
- `GET /api/users/:userId` - Get user by ID

## 🎨 Features in Detail

### User Authentication
- Secure password hashing with bcrypt
- JWT token-based authentication
- Form validation and error handling
- Responsive login/register forms

### Profile Management
- Edit personal information
- Add/remove skills with proficiency levels
- Profile statistics and activity tracking
- Avatar support (ready for implementation)

### User Discovery
- Search by skills and location
- Pagination for large result sets
- Real-time search results
- User cards with skill badges

### Modern UI/UX
- Clean, modern design with Tailwind CSS
- Responsive layout for all devices
- Loading states and animations
- Toast notifications for user feedback

## 🚀 Deployment

### Backend Deployment (Heroku)

1. **Create Heroku app**
   ```bash
   heroku create your-skillswap-app
   ```

2. **Set environment variables**
   ```bash
   heroku config:set MONGODB_URI=your-mongodb-atlas-uri
   heroku config:set JWT_SECRET=your-secret-key
   heroku config:set NODE_ENV=production
   ```

3. **Deploy**
   ```bash
   git push heroku main
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Build the app**
   ```bash
   cd client
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel
   ```

3. **Update API URL**
   - Update the proxy in `client/package.json`
   - Or set environment variables in deployment platform

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js for security headers

## 🧪 Testing

```bash
# Run backend tests
npm test

# Run frontend tests
cd client && npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [Issues](https://github.com/your-repo/issues) page
2. Create a new issue with detailed information
3. Contact the development team

## 🎯 Roadmap

- [ ] Real-time messaging system
- [ ] Video call integration
- [ ] Skill verification system
- [ ] Learning session scheduling
- [ ] Mobile app development
- [ ] Advanced search filters
- [ ] User recommendations
- [ ] Skill assessment quizzes

---

**Built with ❤️ for the global learning community** 