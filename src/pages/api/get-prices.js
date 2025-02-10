// dont prerender as this page will be unique.
export const prerender = false;

import Stripe from "stripe";
import { directusAdmin } from "../../lib/directus";
import { updateItem } from '@directus/sdk';

const STRIPE_KEY = import.meta.env.STRIPE_KEY;

export const POST = async ({ request }) => {
  try {
    const { cart_items } = await request.json();

    // Convert to an array if it's not already an array
    const cartItemsArray = Array.isArray(cart_items)
      ? cart_items
      : Object.values(cart_items);

    const stripe = new Stripe(STRIPE_KEY);

    // Get or create Stripe price object for each cart item
    const prices = await Promise.all(
      cartItemsArray.map(async (item) => {
        const { price } = item;
        let stripePrice = null;

        // If price_id exists, attempt to retrieve the Stripe price
        // TODO: this is broken because renewal prices and non-renewal prices currently use the same Directus Price Object
        // if (price && price.price_id) {
        //   try {
        //     stripePrice = await stripe.prices.retrieve(price.price_id);
        //   } catch (err) {
        //     console.error(`Failed to retrieve Stripe price ${price.price_id}. Creating new Stripe price instead.`, err);
        //   }
        // }

        // If retrieval failed or no price_id exists, create a new Stripe price
        if (!stripePrice) {
          try {
            stripePrice = await stripe.prices.create({
              unit_amount: Math.round((price.isRenewalPrice ? parseFloat(price.amount) / 2 : parseFloat(price.amount)) * 100),
              currency: "eur",
              product: item.product_id,
              nickname: item.price.cycle_id.name + ', Tier ' + item.price.tier,
              metadata: {
                directus_price_id: item.price.id,
                cycle_id: item.price.cycle_id.id,
                cycle_name: item.price.cycle_id.name,
                tier: item.price.tier,
                is_renewal_price: !!price.isRenewalPrice
              },
              billing_scheme: "per_unit",
            });
          } catch (err) {
            console.error(`Failed to create Stripe price:`, err);
          }

          // add new Stripe price_id to Directus price object
          try {
            const result = await directusAdmin.request(updateItem('price', item.price.id, {
              price_id: stripePrice.id,
            }));
          } catch (err) {
            console.error("Error updating Directus price:", err);
          }
        }

        // send Stripe price_id back to checkout session
        if (stripePrice) {
          item.price.price_id = stripePrice.id;
        }

        return item;
      })
    );

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