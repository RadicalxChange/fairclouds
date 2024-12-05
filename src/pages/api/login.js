// dont prerender as this page will be unique.
export const prerender = false;

export const POST = async ({ request, cookies }) => {
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

    // Set cookies
    cookies.set('auth_token', access_token, {
      httpOnly: true,
      secure: 'Secure',
      sameSite: 'strict',
      path: '/',
      maxAge: 3600, // 1 hour
    });

    cookies.set('refresh_token', refresh_token, {
      httpOnly: true,
      secure: 'Secure',
      sameSite: 'strict',
      path: '/',
      maxAge: 604800, // 7 days
    });

    return new Response(JSON.stringify({ message: 'Login successful' }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error("Login endpoint error:", err); // Log the error
    return new Response(JSON.stringify({ error: 'Login failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
