// dont prerender as this page will be unique.
export const prerender = false;

export const POST = async ({ request, cookies }) => {
  const DIRECTUS_URL = "https://cms.fairclouds.life";
  
  // Get the refresh token from cookies.
  const refreshToken = cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return new Response(JSON.stringify({ error: "No refresh token found" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Call Directus's logout endpoint.
    const response = await fetch(`${DIRECTUS_URL}/auth/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Pass the refresh token in the payload.
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({
          error: errorData.errors?.[0]?.message || "Logout failed",
        }),
        {
          status: response.status,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Clear the auth and refresh tokens.
    cookies.delete("auth_token", { path: "/" });
    cookies.delete("refresh_token", { path: "/" });

    return new Response(JSON.stringify({ message: "Logout successful" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Logout endpoint error:", err);
    return new Response(JSON.stringify({ error: "Logout failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
};