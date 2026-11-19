/**
 * Robust CORS origin validator supporting custom domains,
 * Hostinger preview domains (*.hostingersite.com), and multiple origins.
 */
export const isOriginAllowed = (
  origin?: string,
  clientUrlEnv?: string,
  isDev: boolean = false
): boolean => {
  // Allow requests without Origin header (mobile native apps, curl, server-to-server)
  if (!origin) return true;

  // Allow local loopback origin (for local frontend & Flutter web testing)
  if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) {
    return true;
  }

  try {
    const originUrl = new URL(origin);
    const originHost = originUrl.hostname.toLowerCase();
    const cleanOrigin = origin.replace(/\/+$/, '').toLowerCase();

    // 1. Allow production custom domains and all subdomains (e.g. app.zaazb.com, zaazb.com)
    if (originHost === 'zaazb.com' || originHost.endsWith('.zaazb.com')) {
      return true;
    }

    // 2. Allow any Hostinger preview domain (*.hostingersite.com)
    if (originHost.endsWith('.hostingersite.com')) {
      return true;
    }

    // 3. Check explicitly configured CLIENT_URL environment variables
    if (clientUrlEnv) {
      const allowedTokens = clientUrlEnv
        .split(/[,\s]+/)
        .map((t) => t.trim().toLowerCase().replace(/\/+$/, ''))
        .filter(Boolean);

      for (const token of allowedTokens) {
        if (!token) continue;

        // Exact match
        if (cleanOrigin === token) return true;

        // Token without protocol (e.g. app.zaazb.com)
        if (originHost === token) return true;

        // Token with protocol added
        const fullToken = token.startsWith('http://') || token.startsWith('https://')
          ? token
          : `https://${token}`;

        if (cleanOrigin === fullToken) return true;

        try {
          if (originHost === new URL(fullToken).hostname.toLowerCase()) {
            return true;
          }
        } catch {
          // Ignore invalid URL token
        }
      }
    }

    // 4. Default fallback localhost
    if (cleanOrigin === 'http://localhost:3000') {
      return true;
    }
  } catch {
    // If URL parsing fails, perform simple substring match
    if (clientUrlEnv && clientUrlEnv.includes(origin)) {
      return true;
    }
  }

  return false;
};
