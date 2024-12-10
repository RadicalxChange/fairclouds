// dont prerender as this page will be unique.
export const prerender = false;

import Stripe from "stripe";

const STRIPE_KEY = import.meta.env.STRIPE_KEY;

export const POST = async ({ request }) => {
  try {
    const { product_id } = await request.json();
    const stripe = new Stripe(STRIPE_KEY);

    const prices = await stripe.prices.list({
        product: product_id,
    });

    // Return the session's client secret to the client
    return new Response(JSON.stringify({ prices }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to load prices:", error);
    return new Response(JSON.stringify({ error: "Failed to load prices" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}