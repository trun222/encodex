import * as Sentry from '@sentry/node';
import Stripe from 'stripe';
import StripePrisma from '@/src/db/Stripe.prisma';

const stripe = new Stripe(process.env.STRIPE_PRIVATE_KEY!, {
  apiVersion: '2022-08-01',
});

const stripePrisma = new StripePrisma();

export default async function StripePayments(server) {
  server.post('/stripe/create-checkout-session', async (request, reply) => {
    try {
      console.log('request: ', request);
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

      console.log('email', request.body.email);

      // Save Stripe Session ID to DB for a particular user
      const { id, paymentStatus, created, expires_at } = session;
      const createdSession = await stripePrisma.createSession({
        id,
        email: request.body.email,
        paymentStatus,
        created,
        expires: expires_at
      });

      console.log(createdSession);

      // const fetched = await stripePrisma.getSession({
      //   email: request.body.email,
      // });

      // console.log({ fetched });


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

      // For demonstration purposes, we're using the Checkout session to retrieve the customer ID.
      // Typically this is stored alongside the authenticated user in your database.
      const { session_id } = request.body;
      const checkoutSession = await stripe.checkout.sessions.retrieve(session_id);

      // This is the url to which the customer will be redirected when they are done
      // managing their billing with the portal.
      const returnUrl = `${process.env.DOMAIN}/dashboard`;

      const portalSession = await stripe.billingPortal.sessions.create({
        customer: checkoutSession.customer as string,
        return_url: returnUrl,
      });

      console.log('portalSession.url: ', portalSession.url);

      return portalSession.url;
    } catch (e) {
      Sentry.captureException(e);
      Sentry.captureMessage('[POST](/stripe/create-portal-session)', 'error');
      return {
        message: 'Failed to create stripe portal session'
      };
    }
  });
};