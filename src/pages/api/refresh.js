export const prerender = false;

export const POST = async ({ request, cookies }) => {
    const DIRECTUS_URL = "https://cms.fairclouds.life";

    // Get the refresh token from cookies
    const refreshToken = cookies.get('refresh_token')?.value;

    if (!refreshToken) {
        return new Response(JSON.stringify({ error: 'Refresh token not found' }), {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
        });
    }

    try {
        // Send the refresh token to the Directus API
        const response = await fetch(`${DIRECTUS_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refresh_token: refreshToken }),
        });

        if (!response.ok) {
            const error = await response.json();
            console.error('Failed to refresh token:', error);
            return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
                status: 401,
                headers: { 'Content-Type': 'application/json' },
            });
        }

        const { data } = await response.json();
        const { access_token, refresh_token: newRefreshToken } = data;

        // Set cookies
        cookies.set('auth_token', access_token, {
            httpOnly: true,
            secure: 'Secure',
            sameSite: 'strict',
            path: '/',
            maxAge: 3600, // 1 hour
        });
    
        cookies.set('refresh_token', newRefreshToken, {
            httpOnly: true,
            secure: 'Secure',
            sameSite: 'strict',
            path: '/',
            maxAge: 604800, // 7 days
        });

        // Set new tokens in cookies
        return new Response(JSON.stringify({ message: 'Token refreshed successfully' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error('Error refreshing token:', error);
        return new Response(JSON.stringify({ error: 'Failed to refresh token' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        });
    }
};