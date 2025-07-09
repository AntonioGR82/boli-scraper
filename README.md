# FormBuilder Unlimited

A powerful, modern form builder application similar to Typeform with **unlimited records** and no restrictions. Built with React, TypeScript, Node.js, Express, and SQLite.

![FormBuilder Unlimited](https://img.shields.io/badge/Forms-Unlimited-brightgreen)
![Records](https://img.shields.io/badge/Records-No%20Limits-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

## ✨ Features

### 🚀 Form Building
- **Drag & Drop Interface** - Intuitive form building experience
- **11+ Field Types** - Text, Email, Number, Textarea, Select, Radio, Checkbox, Date, Phone, URL, Rating
- **Real-time Preview** - See your form as you build it
- **Field Validation** - Built-in validation for all field types
- **Custom Options** - Add unlimited options to select/radio/checkbox fields

### 📊 Data Management
- **Unlimited Submissions** - No caps on form responses
- **Unlimited Forms** - Create as many forms as you need
- **Real-time Analytics** - Track submission trends and statistics
- **CSV Export** - Export all submissions to CSV format
- **Search & Filter** - Find specific submissions easily

### 🎨 Customization
- **Modern UI/UX** - Clean, responsive design
- **Typeform-like Experience** - Familiar and intuitive interface
- **Mobile Responsive** - Works perfectly on all devices
- **Dark/Light Theme** - Comfortable viewing experience

### 🔒 Security & Performance
- **Rate Limiting** - Protect against spam and abuse
- **Input Validation** - Comprehensive server-side validation
- **SQLite Database** - Fast, reliable local storage
- **CORS Protection** - Secure cross-origin requests

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **TypeScript** - Type-safe development
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **React Hook Form** - Performant form library
- **React Beautiful DnD** - Drag and drop functionality
- **Axios** - HTTP client for API calls

### Backend
- **Node.js** - Server runtime
- **Express** - Web application framework
- **SQLite3** - Embedded database
- **UUID** - Unique identifier generation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd formbuilder-unlimited
```

2. **Install all dependencies**
```bash
npm run setup
```

3. **Start the development servers**
```bash
npm run dev
```

This will start:
- Frontend development server at `http://localhost:3000`
- Backend API server at `http://localhost:5000`

### Production Build

```bash
# Build the frontend
npm run build

# Start the production server
npm start
```

## 📖 Usage

### Creating Your First Form

1. **Access the Dashboard**
   - Open `http://localhost:3000` in your browser
   - Click "Create New Form" or use the "+" button

2. **Build Your Form**
   - Add fields by clicking on field types in the sidebar
   - Drag and drop to reorder fields
   - Configure field properties in the right panel
   - Use the preview mode to test your form

3. **Configure Settings**
   - Set form title and description
   - Configure submission settings
   - Customize success messages

4. **Publish & Share**
   - Click "Publish" to make your form live
   - Share the form URL with your audience
   - Form submissions will appear in real-time

### Managing Submissions

1. **View Submissions**
   - Go to Forms → [Your Form] → Submissions
   - See all responses in a clean table format

2. **Export Data**
   - Click "Export CSV" to download all submissions
   - Data includes timestamps, IP addresses, and all responses

3. **Analytics**
   - View submission trends and statistics
   - Track form performance over time

## 🗄️ Database Schema

### Forms Table
```sql
CREATE TABLE forms (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  fields TEXT NOT NULL,  -- JSON string
  settings TEXT NOT NULL, -- JSON string
  isPublished INTEGER DEFAULT 0,
  submissionCount INTEGER DEFAULT 0,
  createdAt TEXT NOT NULL,
  updatedAt TEXT NOT NULL
);
```

### Submissions Table
```sql
CREATE TABLE submissions (
  id TEXT PRIMARY KEY,
  formId TEXT NOT NULL,
  data TEXT NOT NULL,     -- JSON string
  submittedAt TEXT NOT NULL,
  ip TEXT,
  userAgent TEXT,
  FOREIGN KEY (formId) REFERENCES forms (id) ON DELETE CASCADE
);
```

## 🌐 API Documentation

### Forms Endpoints

- `GET /api/forms` - List all forms (with pagination)
- `GET /api/forms/:id` - Get specific form
- `POST /api/forms` - Create new form
- `PUT /api/forms/:id` - Update form
- `DELETE /api/forms/:id` - Delete form
- `PATCH /api/forms/:id/publish` - Publish/unpublish form
- `POST /api/forms/:id/duplicate` - Duplicate form

### Submissions Endpoints

- `POST /api/forms/:id/submit` - Submit form response
- `GET /api/forms/:id/submissions` - Get form submissions
- `GET /api/forms/:id/submissions/export` - Export submissions as CSV

### Analytics Endpoints

- `GET /api/forms/:id/analytics` - Get form analytics
- `GET /api/analytics/dashboard` - Get dashboard statistics

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the server directory:

```env
PORT=5000
NODE_ENV=development
```

### Client Configuration

The client automatically proxies API requests to the server during development.

## 🚦 Rate Limiting

The application includes built-in rate limiting:

- **General API**: 1000 requests per 15 minutes per IP
- **Form Submissions**: 10 submissions per minute per IP

## 📁 Project Structure

```
formbuilder-unlimited/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── api/           # API client functions
│   │   ├── types/         # TypeScript type definitions
│   │   └── index.css      # Global styles
│   ├── public/            # Static assets
│   └── package.json       # Frontend dependencies
├── server/                # Node.js backend
│   ├── index.js          # Main server file
│   ├── database.js       # Database operations
│   ├── validation.js     # Input validation
│   ├── utils.js          # Utility functions
│   └── package.json      # Backend dependencies
├── package.json          # Root package.json
└── README.md            # This file
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🎯 Key Advantages

### vs. Typeform
- ✅ **Unlimited submissions** (Typeform has limits on free/paid plans)
- ✅ **Self-hosted** (complete data ownership)
- ✅ **No monthly fees** (one-time setup)
- ✅ **Unlimited forms** (no restrictions)
- ✅ **Full customization** (modify as needed)

### vs. Google Forms
- ✅ **Better UX** (modern, clean interface)
- ✅ **More field types** (11+ vs basic fields)
- ✅ **Advanced analytics** (detailed insights)
- ✅ **Professional appearance** (no Google branding)
- ✅ **Export flexibility** (CSV with metadata)

## 🆘 Support

If you encounter any issues or have questions:

1. Check the existing issues on GitHub
2. Create a new issue with detailed information
3. Include steps to reproduce the problem

## 🚀 Deployment

### Docker (Recommended)

```dockerfile
# Coming soon - Docker configuration
```

### VPS/Cloud Deployment

1. Clone the repository on your server
2. Run `npm run setup` to install dependencies
3. Build the frontend with `npm run build`
4. Start the server with `npm start`
5. Configure nginx/apache as reverse proxy
6. Set up SSL certificate

---

**Made with ❤️ for unlimited form building**

*No restrictions. No limits. Just powerful forms.*