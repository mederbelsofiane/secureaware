import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Reset token is required.' }, { status: 400 });
    }

    if (!password || typeof password !== 'string' || password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters.' },
        { status: 400 }
      );
    }

    // Find the token record
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: { select: { id: true, email: true } } },
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link. Please request a new one.' },
        { status: 400 }
      );
    }

    if (resetToken.usedAt) {
      return NextResponse.json(
        { error: 'This reset link has already been used. Please request a new one.' },
        { status: 400 }
      );
    }

    if (new Date() > resetToken.expiresAt) {
      return NextResponse.json(
        { error: 'This reset link has expired. Please request a new one.' },
        { status: 400 }
      );
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update user password and mark token as used in a transaction
    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    return NextResponse.json({ message: 'Password reset successfully.' });
  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
