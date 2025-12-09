import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import {LoginManager, AccessToken, Profile} from 'react-native-fbsdk-next';
import {jwtDecode} from 'jwt-decode';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  FACEBOOK_APP_ID,
  APPLE_IDP_CLIENT_ID,
} from '@env';
import {Platform} from 'react-native';
import {createOpenIdpToken} from './api';

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

    if (!userInfo.data) {
      throw new Error('Google Sign-In failed: No user data');
    }

    return {
      idpId: 'google',
      idpToken: userInfo.data.idToken || '',
      idpClientId,
      email: userInfo.data.user.email,
      firstName: userInfo.data.user.name || 'Google',
      lastName:
        userInfo.data.user.familyName || userInfo.data.user.givenName || 'User',
    };
  } catch (error: any) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};

// Facebook Sign-In function
export const signInWithFacebook = async () => {
  try {
    // Logout any previous session to ensure fresh login
    await LoginManager.logOut();

    // Perform Facebook login with required permissions
    const result = await LoginManager.logInWithPermissions([
      'public_profile',
      'email',
    ]);

    if (result.isCancelled) {
      throw new Error('User cancelled Facebook login');
    }

    // Get the access token
    const data = await AccessToken.getCurrentAccessToken();

    if (!data) {
      throw new Error('Failed to get Facebook access token');
    }

    // Get user profile information
    const profile = await Profile.getCurrentProfile();

    if (!profile) {
      throw new Error('Failed to get Facebook profile');
    }

    console.log('Facebook Sign-In Success:', {
      email: profile.email,
      firstName: profile.firstName,
      lastName: profile.lastName,
      userId: profile.userID,
    });

    return {
      idpId: 'facebook',
      idpToken: data.accessToken,
      idpClientId: FACEBOOK_APP_ID || '',
      email: profile.email || `${profile.userID}@facebook.com`,
      firstName: profile.firstName || 'Facebook',
      lastName: profile.lastName || 'User',
    };
  } catch (error: any) {
    console.error('Facebook Sign-In Error:', error);
    throw error;
  }
};

// Apple Sign-In function
export const signInWithApple = async (): Promise<{
  idpId: string;
  idpToken: string;
  idpClientId: string;
  email: string;
  firstName: string;
  lastName: string;
}> => {
  try {
    // Early exit for non-iOS platforms
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    // Perform Apple authentication request
    const {user, identityToken, email, fullName} =
      await appleAuth.performRequest({
        requestedOperation: appleAuth.Operation.LOGIN,
        requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
      });

    // Verify credential state
    const credentialState = await appleAuth.getCredentialStateForUser(user);
    if (credentialState !== appleAuth.State.AUTHORIZED) {
      throw new Error('Apple Sign-In failed: Not authorized');
    }

    // Identity token is required
    if (!identityToken) {
      throw new Error('Apple Sign-In failed: No identity token');
    }

    // Extract email: direct, from JWT, or fallback
    let userEmail: string | null = email ?? null;
    if (!userEmail) {
      try {
        const decoded = jwtDecode<{email?: string}>(identityToken);
        userEmail = decoded.email ?? null;
      } catch (decodeError) {
        console.error('Failed to decode JWT:', decodeError);
      }
    }
    userEmail = userEmail ?? `${user}@privaterelay.appleid.com`;

    // Extract name (only available on first sign-in)
    const firstName = fullName?.givenName ?? 'Apple';
    const lastName = fullName?.familyName ?? 'User';

    // Create OpenID token via backend
    const {idpToken} = await createOpenIdpToken({
      email: userEmail,
      firstName,
      lastName,
      email_verified: true,
    });

    // Return Sharetribe-compatible payload
    return {
      idpId: 'apple',
      idpToken,
      idpClientId: APPLE_IDP_CLIENT_ID,
      email: userEmail,
      firstName,
      lastName,
    };
  } catch (error: any) {
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
};
