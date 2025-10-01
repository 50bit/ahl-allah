import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import dotenv from 'dotenv';
import session from 'express-session';

// Import routes
import authRoutes from './routes/auth';
import usersRoutes from './routes/users';
import sessionsRoutes from './routes/sessions';
import notesRoutes from './routes/notes';
import complaintsRoutes from './routes/complaints';
import callsRoutes from './routes/calls';
import adminRoutes from './routes/admin';
import organizationsRoutes from './routes/organizations';

// Import middleware
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';
import passport from './config/passport';
import { buildOpenApiSpec, swaggerHtmlPage } from './config/swagger';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 60772;

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Session middleware (for OAuth)
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-session-secret',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Static files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/public', express.static(path.join(__dirname, '../public')));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/complaints', complaintsRoutes);
app.use('/api/calls', callsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/organizations', organizationsRoutes);

// Swagger docs
const openApiSpec = buildOpenApiSpec(app, [
	{ basePath: '/api/auth', router: authRoutes },
	{ basePath: '/api/users', router: usersRoutes },
	{ basePath: '/api/sessions', router: sessionsRoutes },
	{ basePath: '/api/notes', router: notesRoutes },
	{ basePath: '/api/complaints', router: complaintsRoutes },
	{ basePath: '/api/calls', router: callsRoutes },
	{ basePath: '/api/admin', router: adminRoutes },
	{ basePath: '/api/organizations', router: organizationsRoutes }
]);

app.get('/docs.json', (_req: any, res: any) => {
	return res.json(openApiSpec);
});

app.get('/docs', (_req: any, res: any) => {
	res.setHeader('Content-Type', 'text/html; charset=utf-8');
	return res.send(swaggerHtmlPage('/docs.json', 'API Documentation'));
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 200,
    message: 'Server is running',
    data: {
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development'
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(parseInt(PORT.toString()), '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
