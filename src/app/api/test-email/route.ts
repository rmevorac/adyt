import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the API key
const resend = new Resend(process.env.RESEND_API_KEY);

export async function GET(request: Request) {
  try {
    // Log the API key (partially redacted for security)
    const apiKey = process.env.RESEND_API_KEY || '';
    const redactedKey = apiKey.substring(0, 6) + '...' + apiKey.substring(apiKey.length - 4);
    console.log('Using Resend API key:', redactedKey);
    
    // Send a test email
    const data = await resend.emails.send({
      from: 'onboarding@resend.dev', // Use Resend's default domain
      to: 'adyt.studios@gmail.com',
      subject: 'Test Email from Darkroom',
      html: '<p>This is a test email from your Darkroom application!</p>',
    });
    
    console.log('Email send response:', data);
    
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error sending test email:', error);
    return NextResponse.json({ 
      error: 'Failed to send email', 
      details: error instanceof Error ? error.message : String(error) 
    }, { status: 500 });
  }
} 