// Firebase Authentication Management
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import { 
  getDatabase, 
  ref, 
  set, 
  get,
  serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
import { firebaseConfig } from './firebase-config.js';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

// Auth state management
let currentUser = null;

// Initialize auth state listener
export function initAuth() {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, (user) => {
      currentUser = user;
      if (user) {
        console.log('✅ User authenticated:', user.uid);
        updateUserPresence(user);
        resolve(user);
      } else {
        console.log('❌ User not authenticated');
        resolve(null);
      }
    });
  });
}

// Sign up new user
export async function signUp(email, password, username) {
  try {
    console.log('🔄 Creating user account...');
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update profile with username
    await updateProfile(user, { displayName: username });
    
    // Save user data to database under hatch-quiz structure
    await set(ref(db, `hatch-quiz/users/${user.uid}`), {
      uid: user.uid,
      email: user.email,
      username: username,
      displayName: username,
      createdAt: serverTimestamp(),
      lastSeen: serverTimestamp(),
      status: 'online',
      projects: {
        'hatch-chat': true,
        'hatch-quiz': true
      }
    });
    
    console.log('✅ User account created successfully');
    return { success: true, user };
  } catch (error) {
    console.error('❌ Sign up error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// Sign in existing user
export async function signIn(email, password) {
  try {
    console.log('🔄 Signing in user...');
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last seen
    await updateUserPresence(user);
    
    console.log('✅ User signed in successfully');
    return { success: true, user };
  } catch (error) {
    console.error('❌ Sign in error:', error);
    return { success: false, error: getErrorMessage(error.code) };
  }
}

// Sign out user
export async function signOutUser() {
  try {
    if (currentUser) {
      // Update status to offline
      await set(ref(db, `hatch-quiz/users/${currentUser.uid}/status`), 'offline');
      await set(ref(db, `hatch-quiz/users/${currentUser.uid}/lastSeen`), serverTimestamp());
    }
    await signOut(auth);
    console.log('✅ User signed out');
    return { success: true };
  } catch (error) {
    console.error('❌ Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Update user presence
async function updateUserPresence(user) {
  if (!user) return;
  
  try {
    const userRef = ref(db, `hatch-quiz/users/${user.uid}`);
    const snapshot = await get(userRef);
    
    if (snapshot.exists()) {
      // Update existing user
      await set(ref(db, `hatch-quiz/users/${user.uid}/status`), 'online');
      await set(ref(db, `hatch-quiz/users/${user.uid}/lastSeen`), serverTimestamp());
    } else {
      // Create new user record
      await set(userRef, {
        uid: user.uid,
        email: user.email,
        username: user.displayName || user.email.split('@')[0],
        displayName: user.displayName || user.email.split('@')[0],
        createdAt: serverTimestamp(),
        lastSeen: serverTimestamp(),
        status: 'online',
        projects: {
          'hatch-chat': true,
          'hatch-quiz': true
        }
      });
    }
  } catch (error) {
    if (error.code === 'PERMISSION_DENIED') {
      console.error('❌ Permission denied: Firebase Database rules need to be updated.');
      console.error('📋 Please update your Firebase Realtime Database rules to:');
      console.error(`{
  "rules": {
    "hatch-quiz": {
      "users": {
        "$uid": {
          ".read": "auth != null",
          ".write": "auth != null && auth.uid === $uid"
        }
      }
    }
  }
}`);
    } else {
      console.error('❌ Error updating user presence:', error);
    }
  }
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Get user data from database
export async function getUserData(uid) {
  try {
    const snapshot = await get(ref(db, `hatch-quiz/users/${uid}`));
    return snapshot.exists() ? snapshot.val() : null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
}

// Update user profile
export async function updateUserProfile(updates) {
  if (!currentUser) return { success: false, error: 'No user signed in' };
  
  try {
    // Update Firebase Auth profile
    if (updates.displayName) {
      await updateProfile(currentUser, { displayName: updates.displayName });
    }
    
    // Get current user data
    const currentData = await getUserData(currentUser.uid);
    
    // Update database
    await set(ref(db, `hatch-quiz/users/${currentUser.uid}`), {
      ...currentData,
      ...updates,
      lastUpdated: serverTimestamp()
    });
    
    console.log('✅ Profile updated successfully');
    return { success: true };
  } catch (error) {
    console.error('❌ Profile update error:', error);
    return { success: false, error: error.message };
  }
}

// Helper function to get user-friendly error messages
function getErrorMessage(errorCode) {
  switch (errorCode) {
    case 'auth/email-already-in-use':
      return 'This email is already registered. Please sign in instead.';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters long.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-not-found':
      return 'No account found with this email address.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.';
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please try again later.';
    default:
      return 'An error occurred. Please try again.';
  }
}