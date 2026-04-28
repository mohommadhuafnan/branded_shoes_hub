/** User-facing messages for Firebase Auth error codes (Google/email). */
export function formatFirebaseAuthError(err) {
  const code = err?.code
  const known = {
    'auth/email-already-in-use': 'This email is already registered. Try signing in instead.',
    'auth/invalid-credential': 'Invalid email or password.',
    'auth/user-not-found': 'No account found with this email.',
    'auth/wrong-password': 'Incorrect password.',
    'auth/too-many-requests': 'Too many attempts. Please wait a few minutes and try again.',
    'auth/network-request-failed': 'Network error. Check your connection and try again.',
    'auth/popup-closed-by-user': '',
    'auth/cancelled-popup-request': '',
    'auth/popup-blocked':
      'The sign-in popup was blocked. Use the button again to continue in this window.',
    'auth/unauthorized-domain':
      'This domain is not allowed for Firebase Auth. In Firebase Console → Authentication → Settings, add your site under Authorized domains.',
    'auth/operation-not-allowed':
      'This sign-in method is turned off. In Firebase Console → Authentication → Sign-in method, enable Google (and Email/Password if needed).',
    'auth/account-exists-with-different-credential':
      'An account already exists with this email using a different sign-in method.',
    'auth/web-storage-unsupported':
      'Sign-in requires browser storage. Disable private mode or turn off strict blocking for this site.',
    'auth/internal-error': 'Firebase sign-in failed. Try again or use email/password.',
  }
  if (code && known[code] !== undefined) return known[code]
  const msg = String(err?.message || 'Sign-in failed.')
  if (msg.includes('Firebase') && msg.length > 120) return 'Sign-in failed. Check Firebase Console settings and try again.'
  return msg
}
