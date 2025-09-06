# Ahl Allah Quran Memorization Platform - Node.js API

This is a Node.js/TypeScript conversion of the original .NET Ahl Allah Quran memorization platform. The API provides endpoints for user management, session management, notes, complaints, and calls for a Quran memorization application.

## Features

- **User Management**: Registration and authentication for normal users and mohafez (Quran teachers)
- **Session Management**: Create and manage Quran memorization sessions
- **Notes System**: Mohafez can create notes for their students
- **Complaints System**: Students can submit complaints and rate their mohafez
- **Call Management**: Schedule and manage calls between students and mohafez
- **Admin Panel**: Administrative functions for user approval and system management
- **File Upload**: Support for image and document uploads
- **Email Integration**: OTP-based password reset functionality

## Technology Stack

- **Runtime**: Node.js
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: SQL Server with Sequelize ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Email**: Nodemailer
- **File Upload**: Multer
- **Security**: Helmet, CORS, bcryptjs

## Prerequisites

- Node.js (>= 16.0.0)
- SQL Server database
- SMTP email service (Gmail recommended)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd ahl-allah-nodejs
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp env.example .env
```

4. Configure environment variables in `.env`:
```env
# Database Configuration
DB_HOST=your-database-host
DB_PORT=1433
DB_NAME=HefzQuranDB
DB_USER=your-username
DB_PASSWORD=your-password

# JWT Configuration
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
JWT_ISSUER=http://localhost:60772
JWT_AUDIENCE=http://localhost:4200

# Email Configuration
EMAIL_FROM=your-email@gmail.com
EMAIL_SMTP_SERVER=smtp.gmail.com
EMAIL_PORT=465
EMAIL_USERNAME=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# Server Configuration
PORT=60772
NODE_ENV=development

# File Upload
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=5242880
```

5. Build the project:
```bash
npm run build
```

6. Start the server:
```bash
npm start
```

For development:
```bash
npm run dev
```

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - Register normal user
- `POST /api/auth/register-mohafez` - Register mohafez
- `POST /api/auth/forgot-password` - Request password reset OTP
- `POST /api/auth/verify-otp` - Verify OTP
- `POST /api/auth/reset-password` - Reset password with OTP

### Users
- `GET /api/users/get_user/:email` - Get user by email
- `GET /api/users/all` - Get all users (Admin only)
- `GET /api/users/mohafez` - Get mohafez users
- `GET /api/users/normal` - Get normal users
- `PUT /api/users/update` - Update user profile
- `PUT /api/users/update-normal` - Update normal user profile
- `PUT /api/users/update-mohafez` - Update mohafez profile
- `DELETE /api/users/:id` - Delete user (Admin only)

### Sessions
- `GET /api/sessions` - Get all sessions
- `GET /api/sessions/:id` - Get session by ID
- `POST /api/sessions` - Create session (Admin only)
- `PUT /api/sessions/:id` - Update session (Admin only)
- `DELETE /api/sessions/:id` - Delete session (Admin only)

### Notes
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get note by ID
- `POST /api/notes` - Create note (Mohafez only)
- `PUT /api/notes/:id` - Update note (Mohafez only)
- `DELETE /api/notes/:id` - Delete note (Mohafez only)

### Complaints
- `GET /api/complaints` - Get all complaints
- `GET /api/complaints/:id` - Get complaint by ID
- `POST /api/complaints` - Create complaint
- `PUT /api/complaints/:id/status` - Update complaint status (Admin only)
- `PUT /api/complaints/:id/rating` - Add rating to complaint
- `DELETE /api/complaints/:id` - Delete complaint

### Calls
- `GET /api/calls` - Get all calls
- `GET /api/calls/:id` - Get call by ID
- `POST /api/calls` - Create call
- `PUT /api/calls/:id` - Update call
- `DELETE /api/calls/:id` - Delete call

### Admin
- `PUT /api/admin/approve-mohafez/:id` - Approve mohafez (Admin only)
- `PUT /api/admin/reject-mohafez/:id` - Reject mohafez (Admin only)
- `GET /api/admin/pending-mohafez` - Get pending mohafez applications (Admin only)
- `PUT /api/admin/update-role/:id` - Update user role (Admin only)
- `GET /api/admin/statistics` - Get system statistics (Admin only)

## User Roles

- **Admin (1)**: Full system access
- **Mohafez (2)**: Quran teacher with student management capabilities
- **Normal (3)**: Regular student user
- **Not Accepted Mohafez (10)**: Pending mohafez approval

## Database Schema

The application uses the following main entities:
- **Users**: Base user information
- **NormalUsers**: Student-specific information
- **MohafezUsers**: Teacher-specific information
- **Sessions**: Quran memorization sessions
- **Notes**: Notes created by mohafez for students
- **Complaints**: Student complaints and ratings
- **Calls**: Scheduled calls between students and mohafez

## Security Features

- JWT-based authentication
- Password hashing with bcrypt
- CORS protection
- Helmet security headers
- Input validation
- File upload restrictions
- Role-based access control

## Development

The project uses TypeScript for type safety and better development experience. Key development commands:

```bash
# Development with hot reload
npm run dev

# Build for production
npm run build

# Run production build
npm start

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix
```

## File Structure

```
src/
├── config/          # Configuration files (database, JWT, email)
├── controllers/     # Route controllers (if needed)
├── middleware/      # Custom middleware (auth, error handling, upload)
├── models/          # Sequelize models
├── routes/          # Express routes
├── types/           # TypeScript type definitions
├── utils/           # Utility functions
├── app.ts           # Express app configuration
└── server.ts        # Server entry point
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License
