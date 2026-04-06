import { prisma } from '@/lib/db';
import { success, serverError } from '@/lib/server-auth';

// GET /api/settings/maintenance - Public endpoint for maintenance status
export async function GET() {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'maintenance_mode' },
    });

    const enabled = setting?.value === 'true';

    return success({ enabled });
  } catch (error) {
    console.error('GET /api/settings/maintenance error:', error);
    // Default to not in maintenance mode if DB error
    return success({ enabled: false });
  }
}
