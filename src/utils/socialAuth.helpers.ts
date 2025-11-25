import {GoogleSignin} from '@react-native-google-signin/google-signin';
import {GOOGLE_WEB_CLIENT_ID, GOOGLE_IOS_CLIENT_ID} from '@env';
import {Platform} from 'react-native';

// Recommended: Call this once at app startup (e.g., in App.tsx)
export const configureGoogleSignIn = () => {
  GoogleSignin.configure({
    // Required for server-side token validation (Firebase, your backend, etc.)
    webClientId: GOOGLE_WEB_CLIENT_ID, // From Google Cloud → Credentials → Web client (auto created by Firebase)

    // Only needed on iOS – this is the iOS-specific client ID
    iosClientId: GOOGLE_IOS_CLIENT_ID, // e.g., 123456789-xxxxx.apps.googleusercontent.com

    offlineAccess: true, // Needed if you want refresh tokens / server auth code
    forceCodeForRefreshToken: true, // Important for getting a server auth code (recommended)

    // Optional but recommended
    scopes: ['profile', 'email'], // Add more scopes if needed (e.g., 'https://www.googleapis.com/auth/drive.file')
    hostedDomain: undefined, // Restrict to GSuite domain if needed
    profileImageSize: 150,
  });
};

// Your actual sign-in function (clean & reliable)
export const signInWithGoogle = async () => {
  try {
    // 1. Ensure Play Services (Android only – harmless on iOS)
    await GoogleSignin.hasPlayServices({
      showPlayServicesUpdateDialog: true,
    });

    // 2. Clear any previous sign-in (optional – only if you want fresh login every time)
    // Remove this block if you want to silently restore previous session
    const hasPrevious = await GoogleSignin.hasPreviousSignIn();
    if (hasPrevious) {
      await GoogleSignin.signOut(); // This is the correct method
    }

    // 3. Trigger sign-in
    const userInfo = await GoogleSignin.signIn();
    const idpClientId = GOOGLE_WEB_CLIENT_ID;
    // Platform.OS === 'android' ? GOOGLE_WEB_CLIENT_ID : GOOGLE_IOS_CLIENT_ID;

    return {
      idpId: 'google',
      idpToken: userInfo.data.idToken,
      idpClientId,
      email: userInfo.data.user.email,
      firstName: userInfo.data.user.name,
      lastName: userInfo.data.user.familyName || userInfo.data.user.givenName,
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};
