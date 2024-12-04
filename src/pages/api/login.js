// dont prerender as this page will be unique.
export const prerender = false;

export const POST = async ({ request }) => {
  const { email, password } = await request.json();
  const DIRECTUS_URL = "https://cms.fairclouds.life"
  try {
    const response = await fetch(`${DIRECTUS_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(JSON.stringify({ error: errorData.errors[0].message || 'Invalid login credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { data } = await response.json();
    const { access_token, refresh_token } = data;

    const maxAge = 60 * 60 * 24 * 7; // 7 days

    return new Response(JSON.stringify({ message: 'Login successful' }), {
      status: 200,
      headers: {
        'Set-Cookie': [
          `auth_token=${access_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=3600;`, // 1-hour access token
          `refresh_token=${refresh_token}; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=${maxAge};`, // 7-day refresh token
        ].join(' '),
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    console.error("Login endpoint error:", err); // Log the error
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
