// dont prerender as this page will be unique.
export const prerender = false;

export const POST = async ({ request }) => {
  const { email, password } = await request.json();
  const DIRECTUS_URL = import.meta.env.DIRECTUS_URL
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

    const data = await response.json();
    const accessToken = data.data.access_token;

    return new Response(JSON.stringify({ message: 'Login successful' }), {
      status: 200,
      headers: {
        'Set-Cookie': `auth_token=${accessToken}; HttpOnly; Secure; SameSite=Strict; Path=/;`,
        'Content-Type': 'application/json',
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
