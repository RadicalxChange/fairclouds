// dont prerender as this page will be unique.
export const prerender = false;

import { createItem } from '@directus/sdk';
import crypto from 'crypto';
import { directusAdmin } from '../../lib/directus';

export const POST = async ({ request }) => {
  const data = await request.formData()
  const email = data.get("email")
  console.log(email)
  const token = crypto.randomBytes(32).toString('hex');
  const expiration = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 minutes

  try {
    // Store token and expiration in Directus
    await directusAdmin.request(createItem('magic_links', {
      email,
      token,
      expiration,
    }));

    const magicLink = `https://localhost:4321/magic-login?token=${token}`;

    // Send email via Postmark
    const postmarkAPIKey = process.env.POSTMARK_API_TOKEN;
    const postmarkUrl = 'https://api.postmarkapp.com/email';

    const emailData = {
      From: 'hi@jackmurraybrown.com',
      To: email,
      Subject: 'Your Magic Login Link',
      HtmlBody: `<p>Click this link to log in: ${magicLink}</p>`
    };

    const postmarkResponse = await fetch(postmarkUrl, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Postmark-Server-Token': '1853441c-7ac9-4e7a-8586-ec6dd2cb8b0b',
      },
      body: JSON.stringify(emailData)
    });

    if (!postmarkResponse.ok) {
      const errorResponse = await postmarkResponse.json(); // Read and parse the JSON response body
      console.log(errorResponse); // Now you're logging the actual error response from Postmark
      return new Response(JSON.stringify({ message: "Error sending email" }), { status: postmarkResponse.status });
    }

    return new Response(JSON.stringify({ message: "Magic link sent" }), { status: 200 });
  } catch (error) {
    console.error('Error:', error);
    return new Response(JSON.stringify({ message: "Internal Server Error" }), { status: 500 });
  }
};