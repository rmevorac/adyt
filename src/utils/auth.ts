'use client';

/**
 * Client-side authentication utilities
 */

export const sendVerificationCode = async (email: string) => {
  const response = await fetch('/api/auth/send-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || 'Failed to send code');
  }

  return data;
};

export const verifyCode = async (email: string, code: string) => {
  const response = await fetch('/api/auth/verify-code', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });

  const data = await response.json();
  
  if (!response.ok) {
    throw new Error('Invalid or expired code');
  }

  return data;
};

// Session storage functions
export const storeVerificationEmail = (email: string) => {
  sessionStorage.setItem('verificationEmail', email);
};

export const getVerificationEmail = () => {
  return sessionStorage.getItem('verificationEmail');
};

export const clearVerificationEmail = () => {
  sessionStorage.removeItem('verificationEmail');
}; 