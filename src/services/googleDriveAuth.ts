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

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// ✅ محاولة الحصول على Access Token بصمت من الجلسة الحالية بعد refresh
const refreshAccessTokenSilently = async (user: User): Promise<string | null> => {
  try {
    // force refresh to ensure fresh ID token session
    await user.getIdToken(true);

    // Try popup reauth only if needed by your flow; for Firebase OAuth popup flow
    // we can request a fresh OAuth credential by re-sign-in popup when action needs it.
    // Here we keep silent behavior: return current cached token if exists.
    return cachedAccessToken;
  } catch {
    return null;
  }
};

export const initAuth = (
  onAuthSuccess?: (user: User, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (user: User | null) => {
    if (!user) {
      cachedAccessToken = null;
      onAuthFailure?.();
      return;
    }

    // user موجود من جلسة محفوظة
    if (cachedAccessToken) {
      onAuthSuccess?.(user, cachedAccessToken);
      return;
    }

    const refreshed = await refreshAccessTokenSilently(user);
    cachedAccessToken = refreshed;

    // نمرر user حتى لو token=null (الاتصال المنطقي قائم، والتوكن يُطلب عند أول عملية)
    onAuthSuccess?.(user, cachedAccessToken);
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);

    if (!credential?.accessToken) {
      throw new Error('لم نتمكن من استلام رمز الصلاحية (Access Token) من Google');
    }

    cachedAccessToken = credential.accessToken;
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Google Sign In Error Code:', error?.code);
    console.error('Google Sign In Error Message:', error?.message);

    if (
      error?.code === 'auth/popup-closed-by-user' ||
      error?.code === 'auth/cancelled-popup-request' ||
      error?.message?.includes('popup-closed-by-user')
    ) {
      return null;
    }

    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const getAccessToken = async (): Promise<string | null> => cachedAccessToken;

export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

export const logoutGoogle = async () => {
  await signOut(auth);
  cachedAccessToken = null;
};
