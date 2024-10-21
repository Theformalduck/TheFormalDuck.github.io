import { loadStripe } from '@stripe/stripe-js';
import axios from 'axios';
import { Position } from '../types';

const stripePromise = loadStripe('pk_test_51QC1J9FVgYB0mg1hxlsoSj4qia6f8dH1SjcS2jGbv9DFTu5VGL1i9uZpLnFvR41qvHDdgYOGYY8gPom8hcqF4Ebw00x3nA0BMt');

const BASE_PRICE = 10; // Base price for squares
const MAX_PRICE = 99; // Maximum price for squares at (0,0)

export const calculateSquarePrice = (position: Position): number => {
  const distance = Math.sqrt(position.x ** 2 + position.y ** 2);
  const price = BASE_PRICE + (MAX_PRICE - BASE_PRICE) * (1 / (1 + distance / 100));
  return Math.min(MAX_PRICE, Math.round(price * 100) / 100); // Round to 2 decimal places and cap at MAX_PRICE
};

export const processPayment = async (amount: number, paymentMethodId: string): Promise<boolean> => {
  try {
    // Create a payment intent on the server
    const response = await axios.post('/api/create-payment-intent', {
      amount: Math.round(amount * 100), // Stripe expects amounts in cents
      paymentMethodId
    });

    const { clientSecret } = response.data;

    // Confirm the payment on the client side
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Stripe failed to initialize');
    }

    const { paymentIntent, error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: paymentMethodId,
    });

    if (error) {
      console.error('Payment failed:', error);
      return false;
    }

    if (paymentIntent?.status === 'succeeded') {
      return true;
    } else {
      console.error('Payment not successful');
      return false;
    }
  } catch (error) {
    console.error('Error processing payment:', error);
    return false;
  }
};