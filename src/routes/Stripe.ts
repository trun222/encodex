import * as Sentry from '@sentry/node';
import Stripe from 'stripe';
import StripePrisma from '@/src/db/Stripe.prisma';

enum STRIPE_EVENTS {
  CUSTOMER_CREATED = 'customer.created',
  CUSTOMER_UPDATED = 'customer.updated',
  CUSTOMER_SUBSCRIPTION_CREATED = 'customer.subscription.created',
  CUSTOMER_SUBSCRIPTION_UPDATED = 'customer.subscription.updated',
  CUSTOMER_SUBSCRIPTION_DELETED = 'customer.subscription.deleted',
  CHECKOUT_SESSION_COMPLETED = 'checkout.session.completed',
  CHECKOUT_SESSION_EXPIRED = 'checkout.session.expired',
  CHECKOUT_SESSION_PAYMENT_SUCCESS = 'checkout.session.async_payment_succeeded',
  CHECKOUT_SESSION_PAYMENT_FAILED = 'checkout.session.async_payment_failed',
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2022-08-01',
});

const stripePrisma = new StripePrisma();

export default async function StripePayments(server) {
  server.post('/stripe/webhook', {
    config: {
      rawBody: true,
    },
  },
    (request, response) => {
      const sig = request.headers['stripe-signature'];
      let event;

      console.log('reqest: ', request.rawBody);

      try {
        event = stripe.webhooks.constructEvent(request.rawBody, sig, process.env.STRIPE_WEBHOOK_SIGNATURE!);
      }
      catch (err) {
        console.log('err: ', err);
        response.status(400).send(`Webhook Error: ${err.message}`);
      }


      console.log({ event });

      // Handle the event
      switch (event.type) {
        case STRIPE_EVENTS.CUSTOMER_CREATED:
          console.log('CUSTOMER_CREATED!');
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }

      // Return a response to acknowledge receipt of the event
      return {
        received: true
      }
    });

  server.post('/stripe/create-checkout-session', async (request, reply) => {
    try {
      const prices = await stripe.prices.list({
        lookup_keys: [request.body.lookup_key],
        expand: ['data.product'],
      });

      const session: any = await stripe.checkout.sessions.create({
        billing_address_collection: 'auto',
        line_items: [
          {
            price: prices.data[0].id,
            // For metered billing, do not pass quantity
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${process.env.DOMAIN}/?success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.DOMAIN}/pricing`,
      });

      // Save Stripe Session ID to DB for a particular user
      // const { id, paymentStatus, created, expires_at } = session;
      // const createdSession = await stripePrisma.createSession({
      //   id,
      //   email: request.body.email,
      //   paymentStatus,
      //   created,
      //   expires: expires_at
      // });

      return session.url;
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/stripe/create-checkout-session)', 'error');
      return {
        message: 'Failed to create stripe checkout session'
      };
    }
  });

  server.post('/stripe/create-portal-session', async (request, reply) => {
    try {
      // Lookup user most recent stripe session id
      const fetched: any = await stripePrisma.getSession({
        email: request.body.email,
      });

      const customer = await stripe.accounts.retrieve();

      console.log({ fetched });

      const returnUrl = `${process.env.DOMAIN}/dashboard`;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: 'cus_MfANtaBl2Y2oD1',
        return_url: returnUrl,
      });

      console.log('portalSession.url: ', portalSession.url);

      return portalSession.url;
    } catch (e) {
      console.log(e);
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/stripe/create-portal-session)', 'error');
      return {
        message: 'Failed to create stripe portal session'
      };
    }
  });
};