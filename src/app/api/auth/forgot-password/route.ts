import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { emailService } from '@/lib/services/email';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Always return success to avoid user enumeration
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      select: { id: true, name: true, email: true },
    });

    if (user) {
      // Delete any existing unused tokens for this user
      await prisma.passwordResetToken.deleteMany({
        where: { userId: user.id, usedAt: null },
      });

      // Create a new token expiring in 1 hour
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
      const resetToken = await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          expiresAt,
        },
      });

      // Send reset email (fire and forget — don't block response)
      emailService
        .sendPasswordResetEmail({ name: user.name, email: user.email }, resetToken.token)
        .catch((err) => console.error('Failed to send password reset email:', err));
    }

    // Always return success
    return NextResponse.json({
      message: 'If an account with that email exists, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
