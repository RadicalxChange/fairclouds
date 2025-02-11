<script>
    import { onMount } from "svelte";
    import directus from "../lib/directus";
    import { passwordReset } from "@directus/sdk";
  
    let newPassword = "";
    let confirmPassword = "";
    let message = "";
    let error = "";
    let token = "";
  
    // When the component mounts, extract the reset token from the URL.
    onMount(() => {
      const params = new URLSearchParams(window.location.search);
      token = params.get("token");
      if (!token) {
        error = "Reset token not found.";
      }
    });
  
    const handleReset = async (e) => {
      e.preventDefault();
      error = "";
      message = "";
  
      // Validate that the new passwords match.
      if (newPassword !== confirmPassword) {
        error = "Passwords do not match.";
        return;
      }
  
      try {
        // Call Directus to reset the password.
        const result = await directus.request(passwordReset(token, newPassword));
        console.log("Password reset result:", result);
        message = "Your password has been reset successfully.";
      } catch (err) {
        console.error("Password reset error:", err);
        error = err.message || "Failed to reset password. Please try again.";
      }
    };
  </script>
  
  <main style="text-align: center; margin-top: 2rem; margin-left: auto; margin-right: auto; max-width: 700px;">
    {#if message}
      <p>{message}</p>
      <a href="/" style="display: block; margin-top: 1rem; text-decoration: underline;">Return to Home Page</a>
    {:else}
      <form on:submit|preventDefault={handleReset} class="space-y-5">
        <div>
          <input
            type="password"
            bind:value={newPassword}
            placeholder="New Password"
            required
            class="input"
          />
        </div>
        <div>
          <input
            type="password"
            bind:value={confirmPassword}
            placeholder="Confirm Password"
            required
            class="input"
          />
        </div>
        {#if error}
          <p class="error">{error}</p>
        {/if}
        <button type="submit" class="button">Reset Password</button>
      </form>
    {/if}
  </main>  