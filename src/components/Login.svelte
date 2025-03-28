<script>
  import { onMount } from 'svelte';
  import Register from "./Register.svelte";
  import ForgotPassword from "./ForgotPassword.svelte";

  export let lang;
  export let currentUser;
  export let reloadOnClose;

  let email = "";
  let password = "";
  let error = "";
  let isLoggedIn = !!currentUser;
  // currentForm can be "login", "register", or "reset"
  let currentForm = "login";

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
      email = "";
      password = "";
    } catch (err) {
      error = err.message || "An error occurred during login.";
    }
  };

const handleLogout = async () => {
  error = "";
  try {
    const response = await fetch("/api/logout", { method: "POST" });
    if (!response.ok) {
      throw new Error("Logout failed.");
    }
    isLoggedIn = false;
  } catch (err) {
    error = err.message || "Logout failed.";
  }
};
</script>

{#if currentForm === "register"}
  <Register />
  <button class="link mt-4 text-base sm:text-2xl hover-blur" on:click={() => (currentForm = "login")}>
    {lang === "en" ? "Back to Login" : "Volver al inicio de sesión"}
  </button>

{:else if currentForm === "reset"}
  <ForgotPassword />
  <button class="link mt-4 text-base sm:text-2xl" on:click={() => (currentForm = "login")}>
    {lang === "en" ? "Back to Login" : "Volver al inicio de sesión"}
  </button>

{:else if isLoggedIn}
  {#if currentUser}
    <p class="mb-2">{lang === "en" ? "Hi" : "Hola"}, {currentUser.first_name}</p>
    {#if currentUser.credits !== 0}
      <p class="mt-4">You have €{currentUser.credits / 100} in Cloudsteward Credits.</p>
    {/if}
  {:else}
    <p class="mb-2">You are logged in!</p>
  {/if}
  <a href={`/${lang == "en" ? "en" : "es"}/my-clouds`} class="button"
    >{lang === "en" ? "View Cloud Panel" : "Ver panel de nubes"}</a
  >
  <button class="button secondary mt-2" on:click={handleLogout}>
    {lang === "en" ? "Logout" : "Cerrar sesión"}
  </button>

{:else}
  <h2 class="text-lg sm:text-2xl font-semibold mb-4">Login</h2>
  
  <form class="space-y-2 sm:space-y-5" on:submit|preventDefault={handleLogin}>
    <input
      type="email"
      bind:value={email}
      placeholder="Email"
      required
    />
    <input
      type="password"
      bind:value={password}
      placeholder="Password"
      required
    />
    {#if error}
      <p class="error">{error}</p>
    {/if}

    <!-- Link to trigger reset password view -->
    <button type="button" class="block text-left text-sm sm:text-xl hover-blur" on:click={() => (currentForm = "reset")}>
      {lang === "en" ? "Forgot your password?" : "Olvidaste tu contraseña?"}
    </button>

    <button class="button" type="submit">
      {lang === "en" ? "Login" : "Acceso"}
    </button>
  </form>

  <!-- Sign Up button -->
  <button class="button secondary mt-2 sm:mt-4" on:click={() => (currentForm = "register")}>
    {lang === "en" ? "Sign Up" : "Regístrate"}
  </button>
{/if}