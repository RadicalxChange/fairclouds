<script lang="ts">
  import { onMount } from "svelte";
  import { useTranslations } from "../i18n/utils";
  import { createDialog } from "@melt-ui/svelte";
  import Login from "./Login.svelte";

  export let lang: "en" | "es" = "en";

  $: t = useTranslations(lang);

  const {
    elements: { trigger, portalled, overlay, content },
    states: { open },
  } = createDialog();

  // This boolean will be passed into Login.
  // If set to true in the Login component, we know to reload on modal close.
  let reloadOnClose = false;
  let currentUser;

  onMount(async () => {
      // Fetch the current user on component mount.
      try {
        const res = await fetch('/api/current-user');
        if (res.ok) {
          const data = await res.json();
          currentUser = data.user;
        }
      } catch (err) {
        console.error("Failed to fetch current user", err);
      }
  });

  // Watch for when $open changes from true to false.
  // If reloadOnClose was set to true by Login, reload the page.
  $: if (!$open && reloadOnClose) {
    window.location.reload();
  }
</script>

<button class="icon-button has-hint" {...$trigger} use:trigger>
  <span class="sr-only">Account</span>
  <img src="/icons/account.png" alt="" />
  <div role="tooltip" class="hint top-full mt-2 right-0 w-max">
    {t("account-login")}
  </div>
</button>

{#if $open}
  <div {...$portalled} use:portalled>
    <div {...$overlay} use:overlay />
    <div class="modal bg-primary top-[4rem]" {...$content} use:content>
      <div class="overflow-auto custom-scrollbar">
          <Login lang={lang} currentUser={currentUser} bind:reloadOnClose />
      </div>
    </div>
  </div>
{/if}

<style>
  .active {
    filter: blur(1px);
  }
</style>