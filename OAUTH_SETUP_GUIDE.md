# OAuth Setup Guide for Ahl Allah Application

This guide will help you set up Google and Apple OAuth authentication for the Ahl Allah Quran Memorization Platform.

## Prerequisites

- Node.js application running
- Google Cloud Console account
- Apple Developer account (for Apple Sign-In)

## Google OAuth Setup

### 1. Create Google OAuth Application

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth 2.0 Client IDs"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:60772/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)

### 2. Configure Environment Variables

Add these to your `.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:60772/api/auth/google/callback
```

## Apple OAuth Setup

### 1. Create Apple Developer Account

1. Go to [Apple Developer Portal](https://developer.apple.com/)
2. Sign in with your Apple ID
3. Enroll in the Apple Developer Program (if not already enrolled)

### 2. Create App ID

1. Go to "Certificates, Identifiers & Profiles"
2. Click "Identifiers" > "+" to create new
3. Choose "App IDs" > "App"
4. Fill in:
   - Description: "Ahl Allah App"
   - Bundle ID: `com.yourcompany.ahlallah`
5. Enable "Sign In with Apple" capability
6. Register the App ID

### 3. Create Service ID

1. Go to "Identifiers" > "+" > "Services IDs"
2. Fill in:
   - Description: "Ahl Allah Web Service"
   - Identifier: `com.yourcompany.ahlallah.web`
3. Enable "Sign In with Apple"
4. Configure domains and redirect URLs:
   - Primary App ID: Select your App ID
   - Domains: `localhost:60772` (development), `yourdomain.com` (production)
   - Redirect URLs: 
     - `http://localhost:60772/api/auth/apple/callback` (development)
     - `https://yourdomain.com/api/auth/apple/callback` (production)

### 4. Create Private Key

1. Go to "Keys" > "+"
2. Fill in:
   - Key Name: "Ahl Allah Sign In Key"
3. Enable "Sign In with Apple"
4. Configure: Select your App ID
5. Download the key file (.p8)
6. Note the Key ID

### 5. Configure Environment Variables

Add these to your `.env` file:

```env
APPLE_CLIENT_ID=com.yourcompany.ahlallah.web
APPLE_TEAM_ID=your-10-character-team-id
APPLE_KEY_ID=your-10-character-key-id
APPLE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
your-private-key-content-here
-----END PRIVATE KEY-----
APPLE_CALLBACK_URL=http://localhost:60772/api/auth/apple/callback
```

## Frontend Integration

### 1. Google Sign-In Button

```html
<a href="/api/auth/google" class="google-signin-btn">
  <img src="google-logo.png" alt="Google">
  Sign in with Google
</a>
```

### 2. Apple Sign-In Button

```html
<a href="/api/auth/apple" class="apple-signin-btn">
  <img src="apple-logo.png" alt="Apple">
  Sign in with Apple
</a>
```

### 3. Handle OAuth Callback

```javascript
// Handle OAuth callback
const urlParams = new URLSearchParams(window.location.search);
const token = urlParams.get('token');
const provider = urlParams.get('provider');

if (token) {
  // Store token and redirect to dashboard
  localStorage.setItem('authToken', token);
  window.location.href = '/dashboard';
} else if (urlParams.get('error')) {
  // Handle error
  console.error('OAuth error:', urlParams.get('message'));
}
```

## API Endpoints

### OAuth Endpoints

- `GET /api/auth/google` - Initiate Google OAuth
- `GET /api/auth/google/callback` - Google OAuth callback
- `GET /api/auth/apple` - Initiate Apple OAuth
- `POST /api/auth/apple/callback` - Apple OAuth callback
- `GET /api/auth/success` - OAuth success handler
- `GET /api/auth/error` - OAuth error handler

### Profile Completion

- `POST /api/auth/complete-profile` - Complete OAuth user profile

```json
{
  "userId": "user-uuid",
  "country": "Saudi Arabia",
  "city": "Riyadh",
  "birthyear": 1990,
  "gender": "Male",
  "ageGroup": 1,
  "levelAtQuran": 2,
  "numberPerWeek": 3,
  "timeForEverytime": 45,
  "language": 1,
  "methodForHefz": 1
}
```

### Link OAuth Account

- `POST /api/auth/link-oauth` - Link OAuth to existing account

```json
{
  "email": "user@example.com",
  "password": "userpassword",
  "provider": "google",
  "providerId": "google-user-id",
  "avatar": "https://profile-picture-url.com"
}
```

## Database Migration

Run the OAuth migration to add the necessary fields:

```bash
# Using Docker
sudo docker compose exec postgres psql -U postgres -d ahl_allah_db -f /docker-entrypoint-initdb.d/oauth-migration.sql

# Or manually
psql -U postgres -d ahl_allah_db -f src/config/oauth-migration.sql
```

## Testing OAuth

### 1. Start the Application

```bash
# Development
npm run dev

# Or with Docker
sudo docker compose -f docker-compose.dev.yml up
```

### 2. Test OAuth Flow

1. Navigate to `http://localhost:60772/api/auth/google`
2. Complete Google OAuth flow
3. Check if user is created in database
4. Verify JWT token is generated

## Security Considerations

1. **HTTPS in Production**: Always use HTTPS in production
2. **Secure Session Secret**: Use a strong, random session secret
3. **Environment Variables**: Never commit OAuth credentials to version control
4. **Token Validation**: Always validate JWT tokens on protected routes
5. **Rate Limiting**: Implement rate limiting for OAuth endpoints

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**: Check that callback URLs match exactly in OAuth provider settings
2. **"Client ID not found"**: Verify environment variables are set correctly
3. **"Invalid client secret"**: Ensure client secret is copied correctly
4. **Apple Sign-In not working**: Verify Team ID, Key ID, and private key are correct

### Debug Mode

Enable debug logging by setting:

```env
NODE_ENV=development
DEBUG=passport:*
```

## Production Deployment

### 1. Update OAuth Settings

- Update redirect URIs to production domains
- Use production OAuth credentials
- Enable HTTPS

### 2. Environment Variables

```env
NODE_ENV=production
FRONTEND_URL=https://yourdomain.com
GOOGLE_CALLBACK_URL=https://yourdomain.com/api/auth/google/callback
APPLE_CALLBACK_URL=https://yourdomain.com/api/auth/apple/callback
```

### 3. Docker Deployment

```bash
sudo docker compose up -d
```

## Support

For issues with OAuth implementation, check:

1. OAuth provider documentation
2. Application logs
3. Network requests in browser dev tools
4. Database user records

## Additional Resources

- [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign-In Documentation](https://developer.apple.com/sign-in-with-apple/)
- [Passport.js Documentation](http://www.passportjs.org/)

