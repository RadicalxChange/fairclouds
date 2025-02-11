// dont prerender as this page will be unique.
export const prerender = false;

import { parse } from 'cookie';
import directus from '../../lib/directus';
import { withToken, readMe } from '@directus/sdk';

export const GET = async ({ request }) => {
  const cookieHeader = request.headers.get('cookie') || '';
  const cookies = parse(cookieHeader);
  const authToken = cookies.auth_token;

  if (!authToken) {
    return new Response(JSON.stringify({ user: null }), { status: 401 });
  }

  try {
    const user = await directus.request(
      withToken(authToken, readMe({
        fields: [
          "*",
          "licenses.*",
          "licenses.price_id.id",
          "licenses.price_id.amount",
          "licenses.price_id.cloud_id",
          "licenses.price_id.cycle_id.id",
          "licenses.price_id.cycle_id.name",
          "licenses.price_id.cycle_id.start_date",
          "licenses.price_id.cycle_id.end_date",
          "licenses.price_id.cycle_id.prices_status",
          "licenses.price_id.cycle_id.renewal_active",
          "licenses.price_id.tier",
        ],
      }))
    );
    return new Response(JSON.stringify({ user }), { status: 200 });
  } catch (error) {
    console.error("Failed to access current user:", error);
    return new Response(JSON.stringify({ user: null }), { status: 401 });
  }
}