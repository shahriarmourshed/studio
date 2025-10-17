
import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';
import type { UserSettings, Income, Expense, Product, FamilyMember } from '@/lib/types';
import { differenceInDays, parseISO, setYear as setYearDate, isFuture } from 'date-fns';
import { getMessaging } from 'firebase-admin/messaging';

// This function can be triggered by a cron job service.
export async function GET(request: Request) {
  // Authorization check
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${String(currentHour).padStart(2, '0')}:${String(currentMinute).padStart(2, '0')}`;

    console.log(`Cron job running at: ${currentTime}`);

    const usersSnapshot = await adminDb.collection('users').get();

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      const settingsDoc = await adminDb.collection('users').doc(userId).collection('settings').doc('main').get();
      
      if (!settingsDoc.exists) continue;

      const settings = settingsDoc.data() as UserSettings;

      if (!settings.fcmTokens || settings.fcmTokens.length === 0) continue;

      // Check for upcoming transactions
      if (settings.notificationSettings?.transactions?.enabled && settings.notificationSettings.transactions.time === currentTime) {
        const transactions = await getUpcomingTransactions(userId, settings.reminderDays);
        if (transactions.length > 0) {
          const body = `You have ${transactions.length} upcoming transaction(s) due soon.`;
          await sendNotification(settings.fcmTokens, "Upcoming Transactions", body);
        }
      }
      
      // Check for low stock products
      if (settings.notificationSettings?.lowStock?.enabled && settings.notificationSettings.lowStock.time === currentTime) {
        const products = await getLowStockProducts(userId);
        if (products.length > 0) {
          const body = `You have ${products.length} product(s) running low on stock.`;
          await sendNotification(settings.fcmTokens, "Low Stock Alert", body);
        }
      }

      // Check for upcoming events
      if (settings.notificationSettings?.events?.enabled && settings.notificationSettings.events.time === currentTime) {
        const events = await getUpcomingEvents(userId, settings.notificationSettings.events.daysBefore);
        if (events.length > 0) {
          const body = `You have ${events.length} upcoming family event(s) in the next ${settings.notificationSettings.events.daysBefore} days.`;
          await sendNotification(settings.fcmTokens, "Upcoming Family Events", body);
        }
      }
    }

    return NextResponse.json({ success: true, message: 'Cron job executed successfully.' });
  } catch (error) {
    console.error("Error in cron job:", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

async function sendNotification(tokens: string[], title: string, body: string) {
  if (tokens.length === 0) return;

  const message = {
    notification: { title, body },
    tokens: tokens,
  };
  
  try {
    const response = await getMessaging().sendMulticast(message);
    console.log('Successfully sent message:', response);
    if (response.failureCount > 0) {
        const failedTokens: string[] = [];
        response.responses.forEach((resp, idx) => {
            if (!resp.success) {
                failedTokens.push(tokens[idx]);
            }
        });
        console.log('List of tokens that caused failures:', failedTokens);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// --- Data fetching functions ---

async function getUpcomingTransactions(userId: string, reminderDays: number): Promise<(Income | Expense)[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    const incomesSnapshot = await adminDb.collection('users').doc(userId).collection('incomes').where('status', '==', 'planned').get();
    const expensesSnapshot = await adminDb.collection('users').doc(userId).collection('expenses').where('status', '==', 'planned').get();

    const allTransactions = [
        ...incomesSnapshot.docs.map(doc => doc.data() as Income),
        ...expensesSnapshot.docs.map(doc => doc.data() as Expense)
    ];
    
    const upcoming = allTransactions.filter(t => {
        const transactionDate = new Date(t.date);
        return isFuture(transactionDate) && differenceInDays(transactionDate, today) <= reminderDays;
    });

    return upcoming;
}

async function getLowStockProducts(userId: string): Promise<Product[]> {
    const productsSnapshot = await adminDb.collection('users').doc(userId).collection('products').get();
    const products = productsSnapshot.docs.map(doc => doc.data() as Product);

    return products.filter(p => p.lowStockThreshold !== undefined && p.currentStock <= p.lowStockThreshold);
}

async function getUpcomingEvents(userId: string, daysBefore: number): Promise<any[]> {
    const familySnapshot = await adminDb.collection('users').doc(userId).collection('familyMembers').get();
    const familyMembers = familySnapshot.docs.map(doc => doc.data() as FamilyMember);

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const currentYear = today.getFullYear();
    const events = [];

    for (const member of familyMembers) {
        const checkEvent = (dateStr: string | undefined, eventName: string) => {
            if (!dateStr) return;
            try {
                const eventDate = parseISO(dateStr);
                const nextEvent = setYearDate(eventDate, currentYear);
                if (nextEvent < today) {
                    nextEvent.setFullYear(currentYear + 1);
                }
                const daysLeft = differenceInDays(nextEvent, today);
                if (daysLeft >= 0 && daysLeft <= daysBefore) {
                    events.push({
                        member,
                        eventName,
                        eventDate: nextEvent,
                        daysLeft,
                    });
                }
            } catch (e) {
                console.error(`Invalid date for ${eventName} for member ${member.name}`);
            }
        };

        checkEvent(member.birthday, `${member.name}'s Birthday`);
        if(member.specialEventName) {
            checkEvent(member.specialEventDate, member.specialEventName);
        }
    }

    return events.sort((a, b) => a.daysLeft - b.daysLeft);
}
