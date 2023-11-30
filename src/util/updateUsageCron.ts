import { CronJob, sendAt } from 'cron';
import UserPrisma, { UsageType } from '@/src/db/User.prisma';
import * as Sentry from '@sentry/node';
const CRON_PATTERN = '0 0 * * *';
const userPrisma = new UserPrisma();

const determineIfSync = (dateTime: Date) => {
  const myDate: any = new Date(dateTime);
  const today: any = new Date();
  const thirtyDays = 1000 * 60 * 60 * 24 * 30;

  return (today - myDate) > thirtyDays;
}

export const UpdateUsageCron = new CronJob(
  //s m h d m y
  CRON_PATTERN,
  async () => {
    try {
      const userUsages = await userPrisma.getAllUsages();
      console.log({ userUsages });
      userUsages.forEach(async (userUsage) => {
        if (determineIfSync(userUsage.lastSyncDate)) {
          const updated = await userPrisma.updateUsage({ id: userUsage.id, usage: 0, type: UsageType.API, date: new Date() });
          console.log({ updated });
        }
      });
      const dt = sendAt(CRON_PATTERN);
      console.log(`The job would run at: ${dt.toISO()}`);
      console.log(new Date())
      // Update all users usage
      console.log('You will see this message every midnight');
    } catch (e) {
      console.log({ e });
      Sentry.captureException(e);
      Sentry.captureMessage('[UpdateUsageCron]', 'error');
    }
  },
  null,
  true,
  'America/New_York'
);
