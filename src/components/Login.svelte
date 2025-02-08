<script>
  import Register from "./Register.svelte";

  export let lang;
  export let reloadOnClose; 

  let email = "";
  let password = "";
  let error = "";
  let isLoggedIn = false;
  let showRegister = false; // Controls whether to show the Register component

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
      reloadOnClose = true;
    } catch (err) {
      error = err.message || "An error occurred during login.";
    }
  };
</script>

{#if showRegister}
  <Register />
  <button class="button mt-4" on:click={() => (showRegister = false)}>
    {lang === "en" ? "Back to Login" : "Volver al inicio de sesión"}
  </button>
{:else if isLoggedIn}
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

  <!-- Sign Up button -->
  <button class="button secondary mt-4" on:click={() => (showRegister = true)}>
    {lang === "en" ? "Sign Up" : "Regístrate"}
  </button>
{/if}