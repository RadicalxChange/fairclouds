<script>
  // import { onMount } from "svelte";
  import { createDirectus, authentication } from "@directus/sdk";
  // import { useTranslations } from "../i18n/utils";

  export let lang;

  let email = "";
  let password = "";
  let error = "";
  let isLoggedIn = false;

  const client = createDirectus("https://cms.fairclouds.life").with(
    authentication("json"),
  );

  const handleLogin = async () => {
    try {
      await client.login(email, password);

      console.log(client);

      isLoggedIn = true;
      // const response = await fetch("/api/login", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ email, password }),
      // });

      // if (!response.ok) {
      //   const errorData = await response.json();
      //   throw new Error(errorData.error || "Invalid login credentials");
      // }

      // const data = await response.json();
      // console.log(data.message); // Login successful
      // window.location.href = "en/dashboard";
    } catch (err) {
      error = err.message;
    }
  };
</script>

{#if isLoggedIn}
  <p>You are logged in!</p>
  <a href="/en/dashboard">Go to dashboard</a>
{:else}
  <form class="space-y-5" on:submit|preventDefault={handleLogin}>
    <input type="email" bind:value={email} placeholder="Email" required />
    {#if error}
      <p>{error}</p>
    {/if}
    <!-- to do: use proper translation function -->
    <button class="button" type="submit"
      >{lang == "en" ? "Login" : "Acceso"}</button
    >
  </form>
{/if}
