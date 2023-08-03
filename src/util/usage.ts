import { UsageType } from '@/src/db/User.prisma';

export const UsageLimits = {
  free: { api: 10_000, storage: 0, maxFileSize: 1500 * 1024 * 1024 },
  premium: { api: 50_000, storage: 50, maxFileSize: 1500 * 1024 * 1024 },
  pro: { api: 100_000, storage: 500, maxFileSize: 1500 * 1024 * 1024 },
}

export const UpdateUsage = async (request: any, Prisma, fn: any) => {
  const user = request?.headers?.user as any;
  await Prisma.updateUsage(user?.email, user?.usage?.apiUsage + 1, UsageType.API);
  return fn;
}

export const UpdateUsageExec = async (request: any, Prisma, fn: any) => {
  const user = request?.headers?.user as any;
  await Prisma.updateUsage(user?.email, user?.usage?.apiUsage + 1, UsageType.API);
  return await fn();
}