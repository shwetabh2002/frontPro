# Environment Setup Guide

This guide explains how to set up environment-based API configuration for your POS application.

## 🚀 Environment Files Setup

### 1. Create Environment Files

#### For Development (`.env.development`):
```bash
# Development Environment
REACT_APP_API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

#### For Production (`.env.production`):
```bash
# Production Environment
REACT_APP_API_BASE_URL=https://my-backend-7rrf.onrender.com
NODE_ENV=production
```

#### For Local Development (`.env.local`):
```bash
# Local Development (overrides other env files)
REACT_APP_API_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 2. Environment File Priority

React will load environment files in this order (highest priority first):
1. `.env.local` (always loaded, ignored by git)
2. `.env.development` (when NODE_ENV=development)
3. `.env.production` (when NODE_ENV=production)
4. `.env` (always loaded)

### 3. Package.json Scripts

Update your `package.json` scripts to use the correct environment:

```json
{
  "scripts": {
    "start": "react-scripts start",
    "build": "react-scripts build",
    "build:dev": "NODE_ENV=development react-scripts build",
    "build:prod": "NODE_ENV=production react-scripts build",
    "test": "react-scripts test",
    "eject": "react-scripts eject"
  }
}
```

## 🔧 Usage in Code

### Import and Use Environment Configuration

```typescript
import { 
  API_CONFIG, 
  getCurrentEnvironment, 
  getApiBaseUrl, 
  logApiConfig 
} from '../config/api';

// Get current environment
const env = getCurrentEnvironment();
console.log('Current API URL:', env.BASE_URL);

// Get API base URL (respects environment variables)
const apiUrl = getApiBaseUrl();

// Log configuration in development
logApiConfig();
```

### Environment Detection

```typescript
import { isDevelopment, isProduction, isTest } from '../config/api';

if (isDevelopment) {
  console.log('Running in development mode');
  // Use localhost APIs
}

if (isProduction) {
  console.log('Running in production mode');
  // Use production APIs
}
```

## 🌍 Environment Variables Reference

| Variable | Description | Development | Production |
|----------|-------------|-------------|------------|
| `NODE_ENV` | Environment name | `development` | `production` |
| `REACT_APP_API_BASE_URL` | API base URL | `http://localhost:3000` | `https://my-backend-7rrf.onrender.com` |

## 📝 Important Notes

### 1. React Environment Variables
- **Must start with `REACT_APP_`** to be accessible in React
- Only variables prefixed with `REACT_APP_` are embedded in the build

### 2. Build Process
- **Development**: `npm start` uses `.env.development`
- **Production**: `npm run build` uses `.env.production`
- **Local Override**: `.env.local` overrides all other files

### 3. Security
- **Never commit `.env.local`** to version control
- **Never commit production secrets** to version control
- Use `.env.example` for documentation

### 4. Deployment
- Set environment variables in your hosting platform
- For Vercel: Use Environment Variables in project settings
- For Netlify: Use Environment Variables in site settings
- For Render: Use Environment Variables in service settings

## 🚀 Quick Start

1. **Copy the environment files** to your project root
2. **Update the API URLs** if needed
3. **Run the appropriate script**:
   - Development: `npm start`
   - Production Build: `npm run build:prod`
4. **Check the console** for API configuration logs (development only)

## 🔍 Troubleshooting

### Environment Variables Not Loading?
- Ensure they start with `REACT_APP_`
- Restart your development server
- Check file naming and location

### Wrong API URL?
- Verify environment file priority
- Check `NODE_ENV` value
- Ensure `.env.local` doesn't override

### Build Issues?
- Clear build cache: `rm -rf build`
- Check environment file syntax
- Verify all required variables are set
