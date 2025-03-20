// dont prerender as this page will be unique.
export const prerender = false;

import Stripe from "stripe";

const STRIPE_KEY = import.meta.env.STRIPE_KEY;

export const POST = async ({ request }) => {
  try {
    const { line_items, origin, lang, current_user, license_data, discounts } = await request.json();
    const stripe = new Stripe(STRIPE_KEY);
    
    const metadata = {
      user_id: current_user?.id,
      user_credits: current_user?.credits,
    }

    license_data.forEach((license, index) => {
      metadata[`license_${index}`] = JSON.stringify(license);
    });

    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      mode: "payment",
      customer_email: current_user?.email,
      line_items: line_items,
      return_url: `${origin}/${lang}/return?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
      discounts: discounts,
      custom_text: {
        submit: {
          message:
            "Price will be adjusted for each new cycle.",
        },
      },
      metadata,
    });

    // Return the session's client secret to the client
    return new Response(JSON.stringify({ clientSecret: session.client_secret }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to create checkout session:", error);
    return new Response(JSON.stringify({ error: "Failed to create checkout session" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}
