<script>
  import { createDirectus, authentication } from "@directus/sdk";
  import { directusAuth } from "../lib/directus";

  export let lang;

  let email = "";
  let password = "";
  let error = "";
  let isLoggedIn = false;

  // const client = createDirectus("https://cms.fairclouds.life").with(authentication());

  const handleLogin = async () => {
    error = "";
    try {
      const response = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Invalid login credentials");
      }

      isLoggedIn = true;
    } catch (err) {
      error = err.message || "An error occurred during login.";
    }
  };
</script>

{#if isLoggedIn}
  <p>You are logged in!</p>
  <a href="/en/dashboard">Go to dashboard</a>
{:else}
  <form class="space-y-5" on:submit|preventDefault={handleLogin}>
    <input
      type="email"
      bind:value={email}
      placeholder="Email"
      required
      class="input"
    />
    <input
      type="password"
      bind:value={password}
      placeholder="Password"
      required
      class="input"
    />
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <button class="button" type="submit">
      {lang === "en" ? "Login" : "Acceso"}
    </button>
  </form>
{/if}
