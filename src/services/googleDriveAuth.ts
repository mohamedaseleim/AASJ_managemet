import {
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
} from 'firebase/auth';
import { auth } from './firebase';

export { auth };

export const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

const provider = new GoogleAuthProvider();
SCOPES.forEach((scope) => provider.addScope(scope));
provider.setCustomParameters({ prompt: 'select_account' });

const TOKEN_KEY = 'AASJ_GDRIVE_TOKEN_V1';
const TOKEN_TTL_MS = 55 * 60 * 1000; // توكن Google صالح ~60 دقيقة

let cachedAccessToken: string | null = null;

const saveToken = (token: string | null) => {
  cachedAccessToken = token;
  try {
    if (token) {
      sessionStorage.setItem(
        TOKEN_KEY,
        JSON.stringify({ token, expiresAt: Date.now() + TOKEN_TTL_MS })
      );
    } else {
      sessionStorage.removeItem(TOKEN_KEY);
    }
  } catch {
    /* ignore */
  }
};

const loadStoredToken = (): string | null => {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY);
    if (!raw) return null;
    const { token, expiresAt } = JSON.parse(raw);
    if (token && typeof expiresAt === 'number' && expiresAt > Date.now()) {
      return token;
    }
    sessionStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
  return null;
};

// تحقق فعلي أن التوكن ما زال مقبولًا لدى Google
const isTokenValid = async (token: string): Promise<boolean> => {
  try {
    const res = await fetch(
      `https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=${encodeURIComponent(token)}`
    );
    return res.ok;
  } catch {
    return false;
  }
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      saveToken(null);
      onAuthFailure?.();
      return;
    }

    let token = cachedAccessToken || loadStoredToken();
    if (token && !(await isTokenValid(token))) {
      token = null;
      saveToken(null);
    }
    cachedAccessToken = token;
    onAuthSuccess?.(user, token);
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('لم نتمكن من استلام رمز الصلاحية (Access Token) من Google');
    }

    saveToken(credential.accessToken);
    return { user: result.user, accessToken: credential.accessToken };
  } catch (error: any) {
    console.error('Google Sign In Error:', error?.code, error?.message);
    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      return null;
    }
    throw error;
  }
};

export const getAccessToken = async (): Promise<string | null> =>
  cachedAccessToken || loadStoredToken();

export const setCachedAccessToken = (token: string | null) => {
  saveToken(token);
};

export const logoutGoogle = async () => {
  await signOut(auth);
  saveToken(null);
};
