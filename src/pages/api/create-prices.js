// dont prerender as this page will be unique.
export const prerender = false;

import { directusAdmin } from "../../lib/directus";
import { createItem } from '@directus/sdk';

export const POST = async ({ request }) => {
  try {
    const { data } = await request.json();

    const pricesData = data.map(data => {

      const scaling_coefficient = 10;
      const scale = data.num_drawings / scaling_coefficient;

      const roundToTwo = (num) => Math.round(num * 100) / 100;

      const amount = roundToTwo(Math.pow(data.tier - 1, 2) * scale + parseFloat(data.base_price.amount))

      return {
        amount: amount,
        cloud_id: data.base_price.cloud_id,
        cycle_id: data.base_price.cycle_id,
        tier: data.tier,
      }
    });

    // Create new prices in the Directus database
    const prices = await directusAdmin.request(createItem('price', pricesData, {
      fields: [
        "id",
        "amount",
        "cloud_id",
        "cycle_id",
        "tier",
        "price_id",
        "cycle_id.id",
        "cycle_id.name",
        "cycle_id.start_date",
        "cycle_id.end_date",
        "cycle_id.prices_status",
        "cycle_id.renewal_active",
        "licenses.id",
        "licenses.steward",
        "licenses.price_id",
      ]
    }));
    console.log("Created new prices:", prices);

    return new Response(JSON.stringify({ prices }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error("Failed to create new price:", error);
    return new Response(JSON.stringify({ error: "Failed to create new price" }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
}