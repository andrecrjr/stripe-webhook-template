import express from 'express';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-06-20',
});

app.use(express.raw({ type: 'application/json' }));

app.post('/webhook', (req, res) => {
  const sig = req.headers['stripe-signature'] as string;
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(JSON.stringify(paymentIntent.metadata))
      console.log('PaymentIntent was successful!');
      break;
    case 'customer.subscription.created':
      // Lógica para quando uma assinatura é criada
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.status(200).send();
});

const PORT = Number(process.env.PORT) || 8888;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`Server listening on ${process.env.BASE_URL}`);
});