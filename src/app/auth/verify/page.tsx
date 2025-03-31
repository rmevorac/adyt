'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthLayout from '@/components/auth/AuthLayout';
import FormInput from '@/components/auth/FormInput';
import Button from '@/components/auth/Button';
import { verifyCode, getVerificationEmail, sendVerificationCode } from '@/utils/auth';

export default function VerifyCode() {
  const [code, setCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [email, setEmail] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // Handle initial data loading after mount
  useEffect(() => {
    setMounted(true);
    const storedEmail = getVerificationEmail();
    setEmail(storedEmail);
    
    if (!storedEmail) {
      router.push('/auth/signin');
    }
  }, [router]);

  // Handle countdown timer
  useEffect(() => {
    if (!mounted) return;
    
    let timer: NodeJS.Timeout;
    if (resendDisabled && countdown > 0) {
      timer = setInterval(() => setCountdown((prev) => prev - 1), 1000);
    } else if (countdown === 0) {
      setResendDisabled(false);
    }
    return () => clearInterval(timer);
  }, [resendDisabled, countdown, mounted]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setIsLoading(true);
    setError('');

    try {
      await verifyCode(email, code);
      router.push('/dashboard');
    } catch (err) {
      setError('Invalid or expired code. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;

    setResendDisabled(true);
    setCountdown(30);
    setError('');

    try {
      await sendVerificationCode(email);
    } catch (err) {
      setError('Failed to resend code. Please try again.');
    }
  };

  // If not mounted yet, show minimal UI to prevent hydration mismatch
  if (!mounted) {
    return (
      <AuthLayout>
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Enter the 6-digit code we emailed you
          </h2>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Enter the 6-digit code we emailed you
        </h2>
      </div>
      <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
        <div className="rounded-md shadow-sm -space-y-px">
          <FormInput
            id="code"
            name="code"
            type="text"
            placeholder="Enter 6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            required
            maxLength={6}
            pattern="[0-9]{6}"
          />
        </div>

        {error && (
          <div className="text-red-500 text-sm text-center">{error}</div>
        )}

        <div>
          <Button type="submit" isLoading={isLoading} disabled={!email}>
            Verify
          </Button>
        </div>

        <div className="text-sm text-center">
          <button
            type="button"
            onClick={handleResendCode}
            disabled={resendDisabled || !email}
            className="text-blue-600 hover:text-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {resendDisabled
              ? `Resend code in ${countdown}s`
              : "Didn't get the code? Resend"}
          </button>
        </div>
      </form>
    </AuthLayout>
  );
} 