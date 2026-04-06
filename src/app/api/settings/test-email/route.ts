import { NextRequest } from 'next/server';
import { requireRole, unauthorized, forbidden, badRequest, serverError, success } from '@/lib/server-auth';
import { emailService } from '@/lib/services/email';
import { z } from 'zod';

const testEmailSchema = z.object({
  to: z.string().email('Invalid email address'),
});

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(['ADMIN']);
    const body = await req.json();
    const parsed = testEmailSchema.safeParse(body);
    if (!parsed.success) {
      return badRequest(parsed.error.errors.map(e => e.message).join(', '));
    }

    // Invalidate config cache to pick up latest settings
    emailService.invalidateConfig();

    await emailService.sendTestEmail(parsed.data.to);
    return success({ message: 'Test email sent successfully' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    if (message === 'UNAUTHORIZED') return unauthorized();
    if (message === 'FORBIDDEN') return forbidden();
    console.error('Test email error:', message);
    return serverError(message);
  }
}
