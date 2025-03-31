// dont prerender as this page will be unique.
export const prerender = false;

import Stripe from "stripe";

const { STRIPE_KEY } = import.meta.env;

export const POST = async ({ request }) => {
  try {
    const { credits } = await request.json();

    const stripe = new Stripe(STRIPE_KEY);

    const coupon = await stripe.coupons.create({
      name: "Cloudsteward Credits",
      duration: "once",
      amount_off: credits,
      currency: "eur",
    });

    // Return the session's client secret to the client
    return new Response(JSON.stringify({ coupon }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to create Stripe coupon:", error);
    return new Response(JSON.stringify({ error: "Failed to create Stripe coupon" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}