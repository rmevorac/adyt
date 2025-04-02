import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { Resend } from 'resend';

// Create a mock version if API key is missing
const createResendClient = () => {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    // Mock implementation for Resend
    console.log('WARNING: No Resend API key found, using mock implementation');
    return {
      emails: {
        send: async (data: any) => {
          console.log('MOCK EMAIL SEND:', data);
          return { id: 'mock-email-id', data };
        }
      }
    };
  }
  
  return new Resend(apiKey);
};

const resend = createResendClient();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Generate a random 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Generated verification code for ${email}: ${code}`);

    // Save the code to the database
    await prisma.verificationCode.create({
      data: {
        email,
        code,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      },
    });
    console.log('Code saved to database');

    // Send the code via email
    console.log('Sending email with Resend...');
    const emailResult = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default domain
      to: email,
      subject: 'Your Darkroom Verification Code',
      html: `
        <h1>Welcome to Darkroom!</h1>
        <p>Your verification code is: <strong>${code}</strong></p>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this code, you can safely ignore this email.</p>
      `,
    });
    console.log('Email sent:', emailResult);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending code:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send verification code',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
} 