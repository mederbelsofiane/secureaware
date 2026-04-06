import { prisma } from '@/lib/db';

export async function isMaintenanceMode(): Promise<boolean> {
  try {
    const setting = await prisma.setting.findUnique({
      where: { key: 'maintenance_mode' },
    });
    return setting?.value === 'true';
  } catch {
    return false;
  }
}
