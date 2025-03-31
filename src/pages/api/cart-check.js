// dont prerender as this page will be unique.
export const prerender = false;

import { directusAdmin } from "../../lib/directus";
import { readItem } from '@directus/sdk';

export const POST = async ({ request }) => {
  try {
    const { data } = await request.json();

    // Load the prices the user has in their cart.
    const prices = await Promise.all(
      data.map(cartItem => {
        return directusAdmin.request(readItem('price', cartItem.price.id, {
          fields: [ 
            "id",
            "cloud_id.id",
            "cloud_id.name",
            "licenses",
          ]
        }));
      })
    );
    
    // Collect any prices that are no longer available.
    const claimedItems = prices
      .filter(price => price.licenses.length > 0)
      .map(price => {
        return { 
          id: price.cloud_id.id,
          name: price.cloud_id.name,
          price_id: price.id
        }
    });

    return new Response(JSON.stringify({ claimedItems: claimedItems }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to validate prices:", error);
    return new Response(JSON.stringify({ error: "Failed to validate prices" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}