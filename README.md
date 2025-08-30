# POS (Point of Sale) React Web Application

A production-ready Point of Sale web application built with React, featuring role-based access control (RBAC) and comprehensive business management features.

## 🚀 Features

### Authentication & Security
- JWT-based authentication system
- Role-based access control (Admin & Employee roles)
- Protected routes with automatic redirects
- Secure token storage and refresh mechanism

### Admin Dashboard
- **Full System Access**: Complete control over all features
- **Sidebar Navigation**: Collapsible sidebar with menu items
- **Modules Available**:
  - Dashboard with business metrics
  - Employee management
  - Inventory management
  - Sales tracking (personal & all)
  - Customer database
  - Quotations management
  - Invoice management
  - Order tracking

### Employee Dashboard
- **Limited Access**: Customer management only
- **Top Navigation**: Clean top navigation bar
- **Features**:
  - Customer search and filtering
  - Customer list with actions
  - Add new customer functionality

### UI/UX Features
- Responsive design with TailwindCSS
- Modern, clean interface
- Toast notifications for user feedback
- Loading states and error handling
- Active route highlighting
- Hover effects and smooth transitions

## 🛠️ Tech Stack

- **Frontend**: React 19.1.1 with TypeScript
- **State Management**: Redux Toolkit
- **Routing**: React Router v6
- **HTTP Client**: Axios with interceptors
- **Styling**: TailwindCSS
- **Build Tool**: Create React App

## 📁 Project Structure

```
src/
├── app/                    # Redux store configuration
│   ├── store.ts          # Main store setup
│   └── hooks.ts          # Typed Redux hooks
├── components/            # Reusable UI components
│   ├── Button.tsx        # Button component with variants
│   ├── Input.tsx         # Form input component
│   ├── Table.tsx         # Data table component
│   ├── Loader.tsx        # Loading spinner
│   ├── Toast.tsx         # Notification component
│   └── ErrorBoundary.tsx # Error handling
├── features/              # Redux slices
│   └── auth/             # Authentication state
│       └── authSlice.ts  # Auth Redux slice
├── layouts/               # Layout components
│   ├── AdminLayout.tsx   # Admin dashboard layout
│   └── EmployeeLayout.tsx # Employee dashboard layout
├── pages/                 # Page components
│   ├── LoginPage.tsx     # Authentication page
│   ├── admin/            # Admin-specific pages
│   └── employee/         # Employee-specific pages
├── routes/                # Routing configuration
│   ├── index.tsx         # Main route setup
│   ├── PrivateRoute.tsx  # Authentication guard
│   └── RoleBasedRoute.tsx # Role-based access control
├── services/              # API services
│   └── authService.ts    # Authentication API calls
└── utils/                 # Utility functions
    └── auth.ts           # Authentication helpers
```

## 🔐 Authentication

### Login Credentials
- **Admin**: `admin@example.com` / `admin123`
- **Employee**: `employee@example.com` / `employee123`

### API Endpoint
- **Login**: `POST http://localhost:3000/auth/login`
- **Base URL**: `http://localhost:3000`

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd pos-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open your browser**
   Navigate to `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🔧 Configuration

### API Configuration
Update the API base URL in `src/services/authService.ts`:
```typescript
const API_BASE_URL = 'http://localhost:3000'; // Change to your API URL
```

### Environment Variables
Create a `.env` file in the root directory:
```env
REACT_APP_API_URL=http://localhost:3000
```

## 📱 Responsive Design

The application is fully responsive and works on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🎨 Customization

### Styling
- Uses TailwindCSS utility classes
- Custom component variants available
- Easy to modify colors, spacing, and typography

### Components
- All components are modular and reusable
- Easy to extend with new features
- Consistent design patterns throughout

## 🔒 Security Features

- JWT token authentication
- Automatic token refresh
- Route protection based on authentication status
- Role-based access control
- Secure token storage

## 🚧 Future Enhancements

- Real-time notifications
- Advanced reporting and analytics
- Multi-language support
- Dark mode theme
- Offline capabilities
- Advanced search and filtering
- Export functionality (PDF, Excel)
- Audit logging

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Built with ❤️ using React and modern web technologies**
