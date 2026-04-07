import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db';
import { requireOrgRole, orgWhere, unauthorized, forbidden, noOrganization, badRequest, serverError, success } from '@/lib/server-auth';

// GET /api/settings - Return all settings (admin only)
export async function GET() {
  try {
    const user = await requireOrgRole(['ADMIN']);

    // Return both global settings and org-specific settings
    const [globalSettings, orgSettings] = await Promise.all([
      prisma.setting.findMany({ orderBy: { key: 'asc' } }),
      user.organizationId
        ? prisma.orgSetting.findMany({
            where: { organizationId: user.organizationId! },
            orderBy: { key: 'asc' },
          })
        : Promise.resolve([]),
    ]);

    // Merge: org settings override global settings
    const orgSettingsMap = new Map(orgSettings.map((s) => [s.key, s.value]));

    const mergedSettings = globalSettings.map((s) => ({
      ...s,
      value: s.key === 'smtp_pass' ? '***' : (orgSettingsMap.get(s.key) ?? s.value),
      isOrgOverride: orgSettingsMap.has(s.key),
    }));

    // Add org-only settings not in global
    const globalKeys = new Set(globalSettings.map((s) => s.key));
    for (const os of orgSettings) {
      if (!globalKeys.has(os.key)) {
        mergedSettings.push({
          id: os.id,
          key: os.key,
          value: os.value,
          updatedAt: os.updatedAt,
          isOrgOverride: true,
        });
      }
    }

    return success(mergedSettings);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'UNAUTHORIZED') return unauthorized();
    if (msg === 'FORBIDDEN') return forbidden();
    if (msg === 'NO_ORGANIZATION') return noOrganization();
    console.error('GET /api/settings error:', error);
    return serverError('Failed to load settings');
  }
}

// PUT /api/settings - Update settings (admin only)
export async function PUT(req: NextRequest) {
  try {
    const user = await requireOrgRole(['ADMIN']);

    const body = await req.json();

    let settingsToUpdate: { key: string; value: string }[] = [];

    if (body.settings && Array.isArray(body.settings)) {
      settingsToUpdate = body.settings;
    } else if (body.key && body.value !== undefined) {
      settingsToUpdate = [{ key: body.key, value: String(body.value) }];
    } else {
      return badRequest('Provide { key, value } or { settings: [{key, value}] }');
    }

    for (const s of settingsToUpdate) {
      if (!s.key || typeof s.key !== 'string') {
        return badRequest('Each setting must have a valid key');
      }
    }

    settingsToUpdate = settingsToUpdate.filter(
      (s) => !(s.key === 'smtp_pass' && s.value === '***')
    );

    // Save as org-level settings
    const results = await Promise.all(
      settingsToUpdate.map((s) =>
        prisma.orgSetting.upsert({
          where: {
            organizationId_key: {
              organizationId: user.organizationId!,
              key: s.key,
            },
          },
          update: { value: String(s.value) },
          create: {
            organizationId: user.organizationId!,
            key: s.key,
            value: String(s.value),
          },
        })
      )
    );

    return success({ updated: results.length, settings: results });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : '';
    if (msg === 'UNAUTHORIZED') return unauthorized();
    if (msg === 'FORBIDDEN') return forbidden();
    if (msg === 'NO_ORGANIZATION') return noOrganization();
    console.error('PUT /api/settings error:', error);
    return serverError('Failed to update settings');
  }
}
