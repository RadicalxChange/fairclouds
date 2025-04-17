<script>
  import { onMount } from 'svelte';
  import { useTranslations } from "../i18n/utils";
  import Register from "./Register.svelte";
  import ForgotPassword from "./ForgotPassword.svelte";

  export let lang;
  export let currentUser;
  export let reloadOnClose;

  $: t = useTranslations(lang);

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
  <Register lang={lang} />
  <button class="link mt-4 text-base sm:text-2xl hover-blur" on:click={() => (currentForm = "login")}>
    {t("back_to_login")}
  </button>

{:else if currentForm === "reset"}
  <ForgotPassword lang={lang} />
  <button class="link mt-4 text-base sm:text-2xl" on:click={() => (currentForm = "login")}>
    {t("back_to_login")}
  </button>

{:else if isLoggedIn}
  {#if currentUser}
    <p class="mb-2">{t("hi")}, {currentUser.first_name}</p>
    {#if currentUser.credits !== 0}
      <p class="mt-4">{t("you_have")} €{currentUser.credits / 100} {t("in")} Cloudsteward Credits.</p>
    {/if}
  {:else}
    <p class="mb-2">{t("you_are_logged_in")}</p>
  {/if}
  <a href={`/${lang}/cloud-panel`} class="button"
    >{t("view_cloud_panel")}</a
  >
  <button class="button secondary mt-2" on:click={handleLogout}>
    {t("logout")}
  </button>

{:else}
  <h2 class="text-lg sm:text-2xl font-semibold mb-4">{t("login")}</h2>
  
  <form class="space-y-2 sm:space-y-5" on:submit|preventDefault={handleLogin}>
    <input
      type="email"
      bind:value={email}
      placeholder={t("email")}
      required
    />
    <input
      type="password"
      bind:value={password}
      placeholder={t("password")}
      required
    />
    {#if error}
      <p class="error">{error}</p>
    {/if}

    <!-- Link to trigger reset password view -->
    <button type="button" class="block text-left text-sm sm:text-xl hover-blur" on:click={() => (currentForm = "reset")}>
      {t("forgot_password")}
    </button>

    <button class="button" type="submit">
      {t("login")}
    </button>
  </form>

  <!-- Sign Up button -->
  <button class="button secondary mt-2 sm:mt-4" on:click={() => (currentForm = "register")}>
    {t("sign_up")}
  </button>
{/if}