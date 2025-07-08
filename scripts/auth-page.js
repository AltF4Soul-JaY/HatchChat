// Authentication page logic
import { signUp, signIn } from './auth.js';

// DOM elements
const signinForm = document.getElementById('signin-form');
const signupForm = document.getElementById('signup-form');
const authTitle = document.getElementById('auth-title');
const authSubtitle = document.getElementById('auth-subtitle');
const showSignup = document.getElementById('show-signup');
const showSignin = document.getElementById('show-signin');
const authLoading = document.getElementById('auth-loading');
const authError = document.getElementById('auth-error');
const errorText = document.getElementById('error-text');

// Form switching
showSignup.addEventListener('click', () => {
  signinForm.classList.add('hidden');
  signupForm.classList.remove('hidden');
  authTitle.textContent = 'Create Account';
  authSubtitle.textContent = 'Join HatchChat community';
  hideError();
});

showSignin.addEventListener('click', () => {
  signupForm.classList.add('hidden');
  signinForm.classList.remove('hidden');
  authTitle.textContent = 'Welcome Back';
  authSubtitle.textContent = 'Sign in to continue to HatchChat';
  hideError();
});

// Sign in form handler
signinForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const email = document.getElementById('signin-email').value.trim();
  const password = document.getElementById('signin-password').value;
  
  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }
  
  showLoading(true);
  hideError();
  
  console.log('🔄 Attempting sign in...');
  const result = await signIn(email, password);
  
  showLoading(false);
  
  if (result.success) {
    console.log('✅ Sign in successful, redirecting...');
    window.location.href = '/';
  } else {
    console.error('❌ Sign in failed:', result.error);
    showError(result.error);
  }
});

// Sign up form handler
signupForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const username = document.getElementById('signup-username').value.trim();
  const email = document.getElementById('signup-email').value.trim();
  const password = document.getElementById('signup-password').value;
  const confirmPassword = document.getElementById('signup-confirm').value;
  
  if (!username || !email || !password || !confirmPassword) {
    showError('Please fill in all fields');
    return;
  }
  
  if (username.length < 2) {
    showError('Username must be at least 2 characters');
    return;
  }
  
  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }
  
  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }
  
  if (password !== confirmPassword) {
    showError('Passwords do not match');
    return;
  }
  
  showLoading(true);
  hideError();
  
  console.log('🔄 Attempting sign up...');
  const result = await signUp(email, password, username);
  
  showLoading(false);
  
  if (result.success) {
    console.log('✅ Sign up successful, redirecting...');
    window.location.href = '/';
  } else {
    console.error('❌ Sign up failed:', result.error);
    showError(result.error);
  }
});

// Utility functions
function showLoading(show) {
  if (show) {
    authLoading.classList.remove('hidden');
    signinForm.classList.add('hidden');
    signupForm.classList.add('hidden');
  } else {
    authLoading.classList.add('hidden');
    if (authTitle.textContent === 'Welcome Back') {
      signinForm.classList.remove('hidden');
    } else {
      signupForm.classList.remove('hidden');
    }
  }
}

function showError(message) {
  errorText.textContent = message;
  authError.classList.remove('hidden');
}

function hideError() {
  authError.classList.add('hidden');
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check if user is already signed in
import { initAuth } from './auth.js';

initAuth().then(user => {
  if (user) {
    console.log('✅ User already signed in, redirecting...');
    window.location.href = '/';
  } else {
    console.log('❌ User not signed in, showing auth page');
  }
});

console.log('✅ Auth page initialized');