import passport from 'passport';
import { Strategy as GoogleStrategy, Profile as GoogleProfile } from 'passport-google-oauth20';
import AppleStrategy from 'passport-apple';
import { User } from '../models/User';

// Ensure required environment variables are available
const {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_CALLBACK_URL,
  APPLE_CLIENT_ID,
  APPLE_TEAM_ID,
  APPLE_KEY_ID,
  APPLE_PRIVATE_KEY,
  APPLE_CALLBACK_URL
} = process.env as Record<string, string | undefined>;

// Serialize user into the session
passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

// Deserialize user from the session
passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await User.findByPk(id);
    done(null, user || undefined);
  } catch (error) {
    done(error as Error, undefined);
  }
});

// Google OAuth 2.0 Strategy
if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET && GOOGLE_CALLBACK_URL) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        passReqToCallback: true
      },
      async (_req, _accessToken, _refreshToken, profile: GoogleProfile, done) => {
        try {
          const email = profile.emails && profile.emails[0] ? profile.emails[0].value.toLowerCase() : undefined;
          const providerId = profile.id;
          const name = profile.displayName || (profile.name ? `${profile.name.givenName || ''} ${profile.name.familyName || ''}`.trim() : 'Unknown');
          const avatar = profile.photos && profile.photos[0] ? profile.photos[0].value : undefined;

          // Prefer finding by providerId first, then email
          let user = await User.findOne({ where: { provider: 'google', providerId } });
          if (!user && email) {
            user = await User.findOne({ where: { email } });
          }

          if (user) {
            await user.update({
              provider: 'google',
              providerId,
              avatar,
              isEmailVerified: true,
              lastActivityDate: new Date()
            });
            return done(null, user);
          }

          // Create minimal user; other fields can be completed later
          const created = await User.create({
            email: email || `${providerId}@google.local`,
            name,
            country: 'Unknown',
            provider: 'google',
            providerId,
            avatar,
            isEmailVerified: true,
            creationDate: new Date(),
            lastActivityDate: new Date()
          } as any);

          return done(null, created);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

// Apple Strategy
if (APPLE_CLIENT_ID && APPLE_TEAM_ID && APPLE_KEY_ID && APPLE_PRIVATE_KEY && APPLE_CALLBACK_URL) {
  passport.use(
    new AppleStrategy(
      {
        clientID: APPLE_CLIENT_ID,
        teamID: APPLE_TEAM_ID,
        keyID: APPLE_KEY_ID,
        privateKeyString: APPLE_PRIVATE_KEY,
        callbackURL: APPLE_CALLBACK_URL,
        passReqToCallback: true
      },
      async (_req, _accessToken, _refreshToken, idToken, profile, done) => {
        try {
          // Apple may not always provide email/name after first login
          const providerId = (profile && (profile as any).id) || (idToken && (idToken as any).sub);
          const email = (profile && (profile as any).email) || undefined;
          const name = (profile && (profile as any).name) || 'Apple User';

          if (!providerId) {
            return done(new Error('Apple profile missing identifier'));
          }

          let user = await User.findOne({ where: { provider: 'apple', providerId } });
          if (!user && email) {
            user = await User.findOne({ where: { email: String(email).toLowerCase() } });
          }

          if (user) {
            await user.update({
              provider: 'apple',
              providerId,
              isEmailVerified: true,
              lastActivityDate: new Date()
            });
            return done(null, user);
          }

          const created = await User.create({
            email: (email ? String(email).toLowerCase() : `${providerId}@apple.local`),
            name: typeof name === 'string' ? name : 'Apple User',
            country: 'Unknown',
            provider: 'apple',
            providerId,
            isEmailVerified: true,
            creationDate: new Date(),
            lastActivityDate: new Date()
          } as any);

          return done(null, created);
        } catch (error) {
          return done(error as Error, undefined);
        }
      }
    )
  );
}

export default passport;