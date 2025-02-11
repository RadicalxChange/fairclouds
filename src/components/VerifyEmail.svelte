<script>
    import { onMount } from 'svelte';
    import directus from '../lib/directus';
    import { registerUserVerify } from '@directus/sdk';
  
    let message = 'Loading...';
    let showHomeLink = false;
  
    onMount(async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const emailedToken = urlParams.get('token');
  
      if (!emailedToken) {
        message = "Verification token not found.";
        return;
      }
  
      try {
        const result = await directus.request(registerUserVerify(emailedToken));
        message = "Your account has been verified!";
        showHomeLink = true;
      } catch (err) {
        console.error('Verification error:', err);
        message = "Verification failed. Please try again.";
      }
    });
  </script>
  
  <main style="text-align: center; margin-top: 2rem;">
    <p>{message}</p>
    {#if showHomeLink}
      <a href="/" style="display: block; margin-top: 1rem; text-decoration: underline;">Return to Home Page</a>
    {/if}
  </main>  