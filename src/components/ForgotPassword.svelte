<script>
  import { passwordRequest } from '@directus/sdk';
  import directus from "../lib/directus";
  import { useTranslations } from "../i18n/utils";

  export let lang;
  $: t = useTranslations(lang);

  let email = "";
  let error = "";
  let success = "";

  const handleRequestReset = async () => {
    error = "";
    success = "";
    try {
      // Validate input
      if (!email) {
        throw new Error("Email is required");
      }
      // Send the password reset request using the Directus SDK
      const result = await directus.request(passwordRequest(email));
      console.log("Password reset result:", result);
      success = true;
    } catch (err) {
      error = err.message || "Failed to send password reset email.";
    }
  };
</script>

<h2 class="text-lg sm:text-2xl font-semibold mb-4">{t("reset_password")}</h2>

{#if success}
  <div>
    <p class="mb-4">{t("reset_email_sent")}</p>
    <p>{t("check_email_for_instructions")}</p>
  </div>
{:else}
  <form class="space-y-5" on:submit|preventDefault={handleRequestReset}>
    <div>
      <label for="email" class="text-sm sm:text-base">{t("email")}</label>
      <input
        type="email"
        id="email"
        bind:value={email}
        placeholder={t("email")}
        required
      />
    </div>
    {#if error}
      <p class="error">{error}</p>
    {/if}
    <button type="submit" class="button">
      {t("reset_password")}
    </button>
  </form>
{/if}  