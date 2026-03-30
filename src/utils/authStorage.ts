/**
 * Resolve JWT from all places the app may persist it (avoids 401 when token exists only inside flycanary_auth).
 */
export function getBearerTokenFromStorage(): string | null {
  try {
    const direct =
      localStorage.getItem('flycanary_token') || localStorage.getItem('authToken');
    if (direct && String(direct).trim()) {
      return String(direct).trim();
    }
    const raw = localStorage.getItem('flycanary_auth');
    if (raw) {
      const parsed = JSON.parse(raw) as { token?: string };
      if (parsed?.token && typeof parsed.token === 'string' && parsed.token.trim()) {
        return parsed.token.trim();
      }
    }
  } catch {
    // ignore
  }
  return null;
}
