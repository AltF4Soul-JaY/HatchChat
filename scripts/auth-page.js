// auth-page.js - Authentication page logic
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
  
  showLoading(true);
  hideError();
  
  const result = await signIn(email, password);
  
  showLoading(false);
  
  if (result.success) {
    // Redirect to main app
    window.location.href = '/';
  } else {
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
  
  const result = await signUp(email, password, username);
  
  showLoading(false);
  
  if (result.success) {
    // Redirect to main app
    window.location.href = '/';
  } else {
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

// Check if user is already signed in
import { initAuth } from './auth.js';

initAuth().then(user => {
  if (user) {
    // User is already signed in, redirect to main app
    window.location.href = '/';
  }
});