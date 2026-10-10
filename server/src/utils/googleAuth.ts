import { OAuth2Client } from 'google-auth-library';

export interface GooglePayload {
  email: string;
  name: string;
  avatarUrl?: string;
  emailVerified: boolean;
}

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Verifies a Google ID token and returns extracted user payload.
 * Supports mock tokens in non-production environments for deterministic testing.
 */
export const verifyGoogleIdToken = async (idToken: string): Promise<GooglePayload | null> => {
  // Support mock tokens for automated tests and offline development
  if (process.env.NODE_ENV !== 'production' && idToken.startsWith('mock-google-token:')) {
    try {
      const rawData = idToken.replace('mock-google-token:', '');
      const data = JSON.parse(rawData);
      if (!data.email) return null;
      return {
        email: data.email,
        name: data.name || data.email.split('@')[0],
        avatarUrl: data.picture || data.avatarUrl || undefined,
        emailVerified: data.emailVerified !== false,
      };
    } catch {
      return null;
    }
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID || undefined,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return null;
    }

    return {
      email: payload.email,
      name: payload.name || payload.email.split('@')[0],
      avatarUrl: payload.picture,
      emailVerified: !!payload.email_verified,
    };
  } catch {
    return null;
  }
};
