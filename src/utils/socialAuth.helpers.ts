import {GoogleSignin} from '@react-native-google-signin/google-signin';
import appleAuth from '@invertase/react-native-apple-authentication';
import {LoginManager, AccessToken, Profile} from 'react-native-fbsdk-next';
import {jwtDecode} from 'jwt-decode';
import {
  GOOGLE_WEB_CLIENT_ID,
  GOOGLE_IOS_CLIENT_ID,
  FACEBOOK_APP_ID,
} from '@env';
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
export const signInWithApple = async () => {
  try {
    // Check if Apple Sign-In is supported (iOS 13+)
    if (Platform.OS !== 'ios') {
      throw new Error('Apple Sign-In is only available on iOS');
    }

    // Perform the sign-in request
    const appleAuthRequestResponse = await appleAuth.performRequest({
      requestedOperation: appleAuth.Operation.LOGIN,
      requestedScopes: [appleAuth.Scope.EMAIL, appleAuth.Scope.FULL_NAME],
    });

    // Get the credential state
    const credentialState = await appleAuth.getCredentialStateForUser(
      appleAuthRequestResponse.user,
    );

    // Verify the credential state is authorized
    if (credentialState !== appleAuth.State.AUTHORIZED) {
      throw new Error('Apple Sign-In failed: Not authorized');
    }

    const {identityToken, email, fullName} = appleAuthRequestResponse;

    if (!identityToken) {
      throw new Error('Apple Sign-In failed: No identity token');
    }

    // Extract email from JWT if not provided directly
    // Apple only provides email/name on first sign-in, but email is always in the JWT
    let userEmail = email;
    if (!userEmail) {
      try {
        const decodedToken = jwtDecode<{email?: string}>(identityToken);
        userEmail = decodedToken?.email || null;
        console.log('Extracted email from JWT:', userEmail);
      } catch (error) {
        console.error('Failed to decode JWT:', error);
      }
    }

    // If still no email, use a fallback
    if (!userEmail) {
      userEmail = `${appleAuthRequestResponse.user}@privaterelay.appleid.com`;
    }

    // Extract name from fullName object
    // Note: Apple only provides name on FIRST sign-in
    const firstName = fullName?.givenName || 'Apple';
    const lastName = fullName?.familyName || 'User';

    console.log('Apple Sign-In Success:', {
      email: userEmail,
      firstName,
      lastName,
      hasFullName: !!(fullName?.givenName || fullName?.familyName),
    });

    return {
      idpId: 'apple',
      idpToken: identityToken || '',
      idpClientId: 'com.app.EasyCareProvider', // Your app's bundle ID (from JWT aud field)
      email: userEmail,
      firstName: firstName || 'Apple',
      lastName: lastName || 'User',
    };
  } catch (error: any) {
    console.error('Apple Sign-In Error:', error);
    throw error;
  }
};
