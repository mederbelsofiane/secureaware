import { NextRequest } from 'next/server';
import { requireRole, unauthorized, forbidden, badRequest, serverError, success } from '@/lib/server-auth';
import { emailService } from '@/lib/services/email';

// POST /api/settings/test-email - Send test email (admin only)
export async function POST(req: NextRequest) {
  try {
    await requireRole(['ADMIN']);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'UNAUTHORIZED') return unauthorized();
    if (msg === 'FORBIDDEN') return forbidden();
  }

  try {
    const body = await req.json();
    const { to } = body;

    if (!to || typeof to !== 'string' || !to.includes('@')) {
      return badRequest('Valid email address is required');
    }

    await emailService.sendTestEmail(to);

    return success({ message: `Test email sent to ${to}` });
  } catch (error) {
    console.error('POST /api/settings/test-email error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return serverError(`Failed to send test email: ${errorMessage}`);
  }
}
