// auth.js - Firebase Authentication Management
import { initializeApp } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-app.js';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-auth.js';
import { getDatabase, ref, set, get } from 'https://www.gstatic.com/firebasejs/11.9.1/firebase-database.js';
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
        // User is signed in
        console.log('User signed in:', user.uid);
        updateUserPresence(user);
        resolve(user);
      } else {
        // User is signed out
        console.log('User signed out');
        resolve(null);
      }
    });
  });
}

// Sign up new user
export async function signUp(email, password, username) {
  try {
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
      createdAt: Date.now(),
      lastSeen: Date.now(),
      status: 'online',
      projects: {
        'hatch-chat': true,
        'hatch-quiz': true
      }
    });
    
    return { success: true, user };
  } catch (error) {
    console.error('Sign up error:', error);
    return { success: false, error: error.message };
  }
}

// Sign in existing user
export async function signIn(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    
    // Update last seen
    await updateUserPresence(user);
    
    return { success: true, user };
  } catch (error) {
    console.error('Sign in error:', error);
    return { success: false, error: error.message };
  }
}

// Sign out user
export async function signOutUser() {
  try {
    if (currentUser) {
      // Update status to offline
      await set(ref(db, `hatch-quiz/users/${currentUser.uid}/status`), 'offline');
      await set(ref(db, `hatch-quiz/users/${currentUser.uid}/lastSeen`), Date.now());
    }
    await signOut(auth);
    return { success: true };
  } catch (error) {
    console.error('Sign out error:', error);
    return { success: false, error: error.message };
  }
}

// Update user presence
async function updateUserPresence(user) {
  if (!user) return;
  
  const userRef = ref(db, `hatch-quiz/users/${user.uid}`);
  const snapshot = await get(userRef);
  
  if (snapshot.exists()) {
    // Update existing user
    await set(ref(db, `hatch-quiz/users/${user.uid}/status`), 'online');
    await set(ref(db, `hatch-quiz/users/${user.uid}/lastSeen`), Date.now());
  } else {
    // Create new user record
    await set(userRef, {
      uid: user.uid,
      email: user.email,
      username: user.displayName || user.email.split('@')[0],
      displayName: user.displayName || user.email.split('@')[0],
      createdAt: Date.now(),
      lastSeen: Date.now(),
      status: 'online',
      projects: {
        'hatch-chat': true,
        'hatch-quiz': true
      }
    });
  }
}

// Get current user
export function getCurrentUser() {
  return currentUser;
}

// Get user data from database
export async function getUserData(uid) {
  const snapshot = await get(ref(db, `hatch-quiz/users/${uid}`));
  return snapshot.exists() ? snapshot.val() : null;
}

// Update user profile
export async function updateUserProfile(updates) {
  if (!currentUser) return { success: false, error: 'No user signed in' };
  
  try {
    // Update Firebase Auth profile
    if (updates.displayName) {
      await updateProfile(currentUser, { displayName: updates.displayName });
    }
    
    // Update database
    await set(ref(db, `hatch-quiz/users/${currentUser.uid}`), {
      ...await getUserData(currentUser.uid),
      ...updates,
      lastUpdated: Date.now()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Profile update error:', error);
    return { success: false, error: error.message };
  }
}