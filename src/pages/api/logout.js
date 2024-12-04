// dont prerender as this page will be unique.
export const prerender = false;

export const POST = async () => {
    return new Response(null, {
      status: 204,
      headers: {
        'Set-Cookie': `auth_token=; HttpOnly; Secure; SameSite=Strict; Path=/; Max-Age=0;`,
      },
    });
  };
  