import { Request, Response, NextFunction } from 'express';
import passport from '../config/passport';
import { sendSuccess, sendError } from '../utils/response';
import { generateToken } from '../config/jwt';

// OAuth callback handler
export const handleOAuthCallback = (provider: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return sendError(res, 401, 'OAuth authentication failed');
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        roleId: user.roleId
      });

      // Redirect to frontend with token
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      const redirectUrl = `${frontendUrl}/auth/callback?token=${token}&provider=${provider}`;
      
      res.redirect(redirectUrl);
    } catch (error) {
      console.error(`${provider} OAuth callback error:`, error);
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
      res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
    }
  };
};

// OAuth success handler (for API responses)
export const handleOAuthSuccess = (provider: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any;
      
      if (!user) {
        return sendError(res, 401, 'OAuth authentication failed');
      }

      // Generate JWT token
      const token = generateToken({
        userId: user.id,
        email: user.email,
        roleId: user.roleId
      });

      sendSuccess(res, `${provider} authentication successful`, {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          roleId: user.roleId,
          provider: user.provider,
          avatar: user.avatar,
          isEmailVerified: user.isEmailVerified
        }
      });
    } catch (error) {
      console.error(`${provider} OAuth success error:`, error);
      sendError(res, 500, 'Authentication failed');
    }
  };
};

// OAuth failure handler
export const handleOAuthFailure = (req: Request, res: Response, next: NextFunction) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
  res.redirect(`${frontendUrl}/auth/error?message=Authentication failed`);
};

// Middleware to check if user is new (for onboarding)
export const checkNewUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user as any;
    
    if (!user) {
      return sendError(res, 401, 'User not authenticated');
    }

    // Check if user needs to complete profile
    const needsProfileCompletion = !user.country || user.country === 'Unknown' || 
                                  !user.birthyear || !user.gender;

    if (needsProfileCompletion) {
      return sendSuccess(res, 'Profile completion required', {
        needsProfileCompletion: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          provider: user.provider,
          avatar: user.avatar
        }
      });
    }

    next();
  } catch (error) {
    console.error('Check new user error:', error);
    sendError(res, 500, 'Failed to check user status');
  }
};

