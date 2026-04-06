import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireRole, unauthorized, forbidden, badRequest, serverError, success } from '@/lib/server-auth';

// GET /api/settings - Return all settings (admin only)
export async function GET() {
  try {
    await requireRole(['ADMIN']);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'UNAUTHORIZED') return unauthorized();
    if (msg === 'FORBIDDEN') return forbidden();
  }

  try {
    const settings = await prisma.setting.findMany({
      orderBy: { key: 'asc' },
    });

    // Filter out smtp_pass for security
    const safeSettings = settings.map((s) => ({
      ...s,
      value: s.key === 'smtp_pass' ? '***' : s.value,
    }));

    return success(safeSettings);
  } catch (error) {
    console.error('GET /api/settings error:', error);
    return serverError('Failed to load settings');
  }
}

// PUT /api/settings - Update settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    await requireRole(['ADMIN']);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'UNAUTHORIZED') return unauthorized();
    if (msg === 'FORBIDDEN') return forbidden();
  }

  try {
    const body = await req.json();

    // Support both single { key, value } and bulk { settings: [{key, value}] }
    let settingsToUpdate: { key: string; value: string }[] = [];

    if (body.settings && Array.isArray(body.settings)) {
      settingsToUpdate = body.settings;
    } else if (body.key && body.value !== undefined) {
      settingsToUpdate = [{ key: body.key, value: String(body.value) }];
    } else {
      return badRequest('Provide { key, value } or { settings: [{key, value}] }');
    }

    // Validate entries
    for (const s of settingsToUpdate) {
      if (!s.key || typeof s.key !== 'string') {
        return badRequest('Each setting must have a valid key');
      }
    }

    // Skip updating smtp_pass if it's masked
    settingsToUpdate = settingsToUpdate.filter(
      (s) => !(s.key === 'smtp_pass' && s.value === '***')
    );

    // Upsert each setting
    const results = await Promise.all(
      settingsToUpdate.map((s) =>
        prisma.setting.upsert({
          where: { key: s.key },
          update: { value: String(s.value) },
          create: { key: s.key, value: String(s.value) },
        })
      )
    );

    return success({ updated: results.length, settings: results });
  } catch (error) {
    console.error('PUT /api/settings error:', error);
    return serverError('Failed to update settings');
  }
}
