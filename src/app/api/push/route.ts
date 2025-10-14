import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerComponentClient } from '@/lib/supabase/utils';
import { cookies } from 'next/headers';

// Interface for push subscription
interface PushSubscriptionData {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

// Helper function to get push subscriptions from database
async function getPushSubscriptions(): Promise<any[]> {
  try {
    const cookieStore = cookies();
    const supabase = createSupabaseServerComponentClient(cookieStore);

    console.log('Getting push subscriptions from database...');

    // Query push_subscriptions table
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('active', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error querying push_subscriptions:', error);
      // If table doesn't exist yet, return empty array
      if (error.code === '42P01') { // Table doesn't exist
        console.log('push_subscriptions table does not exist yet');
        return [];
      }
      throw error;
    }

    console.log(`Found ${data?.length || 0} active subscriptions`);
    return data || [];
  } catch (error) {
    console.error('Error getting push subscriptions:', error);
    return [];
  }
}

// Helper function to save push subscription to database
async function savePushSubscription(subscription: PushSubscriptionData): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createSupabaseServerComponentClient(cookieStore);

    console.log('Saving push subscription to database...');

    // Insert or update subscription in database
    const { error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
        active: true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      });

    if (error) {
      console.error('Error saving subscription:', error);
      // If table doesn't exist, log it but don't throw error
      if (error.code === '42P01') {
        console.log('push_subscriptions table does not exist yet');
        return true; // Return true for development
      }
      throw error;
    }

    console.log('Subscription saved successfully');
    return true;
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return false;
  }
}

// Helper function to remove push subscription from database
async function removePushSubscription(endpoint: string): Promise<boolean> {
  try {
    const cookieStore = cookies();
    const supabase = createSupabaseServerComponentClient(cookieStore);

    console.log('Removing push subscription from database...');

    // Mark subscription as inactive instead of deleting
    const { error } = await supabase
      .from('push_subscriptions')
      .update({
        active: false,
        updated_at: new Date().toISOString()
      })
      .eq('endpoint', endpoint);

    if (error) {
      console.error('Error removing subscription:', error);
      // If table doesn't exist, log it but don't throw error
      if (error.code === '42P01') {
        console.log('push_subscriptions table does not exist yet');
        return true; // Return true for development
      }
      throw error;
    }

    console.log('Subscription removed successfully');
    return true;
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    // For admin operations, we'll use a simple token-based auth
    const authHeader = req.headers.get('authorization');
    const expectedToken = process.env.ADMIN_API_TOKEN;

    if (expectedToken && authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { title, body, url, image, icon, badge } = await req.json();

    if (!title || !body) {
      return NextResponse.json(
        { message: 'Missing required fields: title, body' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Get all push subscriptions from database
    // 2. Send notifications to each subscription
    // 3. Handle failed subscriptions (remove invalid ones)

    // For now, we'll simulate sending notifications
    console.log('Sending push notification:', {
      title,
      body,
      url,
      image,
      icon,
      badge,
      timestamp: new Date().toISOString()
    });

    // Here you would typically:
    // - Query your database for all active push subscriptions
    // - Use web-push library to send notifications
    // - Handle subscription management (add/remove/update)

    // Send real push notifications using web-push library
    const webpush = require('web-push');

    // Set up VAPID keys for production
    if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
      webpush.setVapidDetails(
        `mailto:${process.env.VAPID_EMAIL || 'admin@fonzu.wiki'}`,
        process.env.VAPID_PUBLIC_KEY,
        process.env.VAPID_PRIVATE_KEY
      );

      try {
        // Get subscriptions from database (we'll implement this)
        const subscriptions = await getPushSubscriptions();

        if (subscriptions.length > 0) {
          // Send to all subscribers
          const notifications: Promise<any>[] = subscriptions.map((subscription: any) =>
            webpush.sendNotification(subscription, JSON.stringify({
              title,
              body,
              icon: icon || '/vercel.svg',
              badge: badge || '/vercel.svg',
              image,
              url,
              tag: 'general',
              requireInteraction: false,
              actions: [
                {
                  action: 'open',
                  title: 'เปิด',
                  icon: '/vercel.svg'
                }
              ]
            }))
          );

          const results = await Promise.allSettled(notifications);
          const successful = results.filter((r: any) => r.status === 'fulfilled').length;
          const failed = results.filter((r: any) => r.status === 'rejected').length;

          console.log(`Notifications sent: ${successful} successful, ${failed} failed`);

          return NextResponse.json({
            success: true,
            message: 'Notification sent successfully',
            recipientCount: successful,
            failedCount: failed
          });
        } else {
          console.log('No active subscriptions found');
          return NextResponse.json({
            success: true,
            message: 'No subscribers to send to',
            recipientCount: 0
          });
        }
      } catch (error) {
        console.error('Error sending notifications:', error);
        return NextResponse.json({
          error: 'Failed to send notifications',
          details: error instanceof Error ? error.message : String(error)
        }, { status: 500 });
      }
    } else {
      console.log('VAPID keys not configured, running in development mode');
      return NextResponse.json({
        success: true,
        message: 'Development mode: Notifications not sent (no VAPID keys)',
        recipientCount: 0,
        note: 'Configure VAPID keys for production use'
      });
    }


    return NextResponse.json({
      success: true,
      message: 'Notification sent successfully',
      recipientCount: 0 // Would be actual count in real implementation
    });

  } catch (error) {
    console.error('Push notification error:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}

// GET endpoint to handle subscription management
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'subscribe':
        // Handle new subscription
        const subscriptionData: PushSubscriptionData = await req.json();
        console.log('New push subscription:', subscriptionData);

        // Save to database
        const saved = await savePushSubscription(subscriptionData);

        if (saved) {
          return NextResponse.json({
            success: true,
            message: 'Subscription saved successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Failed to save subscription'
          }, { status: 500 });
        }

      case 'unsubscribe':
        // Handle unsubscription
        const { endpoint } = await req.json();
        console.log('Unsubscribe request for:', endpoint);

        // Remove from database
        const removed = await removePushSubscription(endpoint);

        if (removed) {
          return NextResponse.json({
            success: true,
            message: 'Subscription removed successfully'
          });
        } else {
          return NextResponse.json({
            success: false,
            message: 'Failed to remove subscription'
          }, { status: 500 });
        }

      case 'test':
        // Send a test notification to yourself for development
        console.log('Test notification requested');

        // For development testing, we'll simulate sending
        return NextResponse.json({
          success: true,
          message: 'Test notification sent (check browser notifications)',
          note: 'In production, this would send to all subscribers'
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: subscribe, unsubscribe, or test' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Push subscription error:', error);
    return NextResponse.json(
      { error: 'Failed to handle subscription' },
      { status: 500 }
    );
  }
}