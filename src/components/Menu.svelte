<script lang="ts">
  import { onMount } from "svelte";
  import { useTranslations } from "../i18n/utils";
  import { createDialog } from "@melt-ui/svelte";

  export let lang: "en" | "es" = "en";
  
  $: t = useTranslations(lang);

  const {
    elements: { trigger, portalled, overlay, content },
    states: { open },
  } = createDialog();

  let tab = "info";
  let isMobileLandscape = false;

  // Update orientation by comparing width and height.
  function updateOrientation() {
    isMobileLandscape = window.innerWidth < 768 && window.innerWidth > window.innerHeight;
  }

  onMount(() => {
    // Auto-open the first time the user visits the map during this session.
    if (window.location.pathname === `/${lang}/map` && !sessionStorage.getItem('mapMenuOpened')) {
      open.set(true);
      sessionStorage.setItem('mapMenuOpened', 'true');
    }

    // Handle mobile landscape orientation
    updateOrientation();
    window.addEventListener("resize", updateOrientation);
    window.addEventListener("orientationchange", updateOrientation);

    return () => {
      window.removeEventListener("resize", updateOrientation);
      window.removeEventListener("orientationchange", updateOrientation);
    };
  });
</script>

<button class="icon-button has-hint" {...$trigger} use:trigger>
  <span class="sr-only">Menu</span>
  <svg
    class="mx-auto"
    width="33"
    height="8"
    viewBox="0 0 33 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M31.4695 2.40594C31.013 2.40594 30.5834 2.57377 30.288 2.93741C30.2343 2.82552 30.2343 2.82552 30.1806 2.76958C30.5297 2.48986 30.6908 2.07028 30.6908 1.59475C30.6908 0.727621 30.0195 0.0283203 29.1871 0.0283203H26.8779C26.0456 0.0283203 25.3206 0.727621 25.3206 1.59475C25.3206 2.07028 25.5354 2.46189 25.8845 2.76958C25.8308 2.82552 25.7771 2.88147 25.7234 2.93741C25.4548 2.57377 25.0521 2.40594 24.5956 2.40594C23.7632 2.40594 23.0382 3.10524 23.0382 3.97238C23.0382 4.83951 23.7632 5.53881 24.5956 5.53881C25.0521 5.53881 25.428 5.37098 25.7234 5.00734C25.7771 5.06328 25.8308 5.11923 25.8845 5.17517C25.5354 5.45489 25.3206 5.87447 25.3206 6.35C25.3206 7.21713 26.0456 7.97238 26.8779 7.97238H29.1871C30.0195 7.97238 30.6908 7.21713 30.6908 6.35C30.6908 5.87447 30.5297 5.48287 30.1806 5.17517C30.2343 5.11923 30.2343 5.11923 30.288 5.00734C30.5565 5.37098 31.013 5.53881 31.4695 5.53881C32.3019 5.53881 32.9731 4.83951 32.9731 3.97238C33 3.10524 32.3287 2.40594 31.4695 2.40594ZM19.9504 2.40594C19.4939 2.40594 19.118 2.57377 18.8226 2.93741C18.7689 2.88147 18.7689 2.88147 18.7152 2.76958C18.9837 2.48986 19.2254 2.07028 19.2254 1.59475C19.2254 0.727621 18.5541 0.0283203 17.668 0.0283203H15.3588C14.5264 0.0283203 13.8552 0.727621 13.8552 1.59475C13.8552 2.07028 14.07 2.46189 14.3653 2.76958C14.3116 2.88147 14.3116 2.88147 14.2579 2.93741C13.9894 2.57377 13.533 2.40594 13.0765 2.40594C12.2441 2.40594 11.5728 3.10524 11.5728 3.97238C11.5728 4.83951 12.2441 5.53881 13.0765 5.53881C13.533 5.53881 13.9626 5.37098 14.2579 5.00734C14.3116 5.06328 14.3116 5.06329 14.3653 5.17517C14.0968 5.45489 13.8552 5.87447 13.8552 6.35C13.8552 7.21713 14.5264 7.97238 15.3588 7.97238H17.668C18.5541 7.97238 19.2254 7.21713 19.2254 6.35C19.2254 5.87447 19.0106 5.48287 18.7152 5.17517C18.7689 5.06329 18.7689 5.06328 18.8226 5.00734C19.0911 5.37098 19.4939 5.53881 19.9504 5.53881C20.8365 5.53881 21.5077 4.83951 21.5077 3.97238C21.5077 3.10524 20.8365 2.40594 19.9504 2.40594ZM8.4581 2.40594C8.00163 2.40594 7.57201 2.57377 7.27665 2.93741C7.22295 2.82552 7.22295 2.82552 7.16924 2.76958C7.51831 2.48986 7.67941 2.07028 7.67941 1.59475C7.67941 0.727621 7.00814 0.0283203 6.17575 0.0283203H3.86656C3.03417 0.0283203 2.30919 0.727621 2.30919 1.59475C2.30919 2.07028 2.524 2.46189 2.87307 2.76958C2.81937 2.82552 2.76566 2.88147 2.71196 2.93741C2.4166 2.57377 2.01383 2.40594 1.55736 2.40594C0.72498 2.40594 0 3.10524 0 3.97238C0 4.83951 0.72498 5.53881 1.55736 5.53881C2.01383 5.53881 2.38975 5.37098 2.68511 5.00734C2.73881 5.06328 2.79251 5.11923 2.84622 5.17517C2.49715 5.45489 2.28234 5.87447 2.28234 6.35C2.28234 7.21713 3.00732 7.97238 3.83971 7.97238H6.1489C6.98129 7.97238 7.65256 7.21713 7.65256 6.35C7.65256 5.87447 7.49146 5.48287 7.14239 5.17517C7.19609 5.11923 7.19609 5.11923 7.2498 5.00734C7.51831 5.37098 7.97478 5.53881 8.43124 5.53881C9.26363 5.53881 9.93491 4.83951 9.93491 3.97238C9.96176 3.10524 9.29048 2.40594 8.4581 2.40594Z"
      fill="white"
    />
  </svg>
  <div role="tooltip" class="hint top-full mt-2 right-0 w-max">
    Menu
  </div>
</button>

{#if $open}
  <div {...$portalled} use:portalled>
    <div {...$overlay} use:overlay />
    <div class="modal bg-primary top-[4rem]" {...$content} use:content>
      {#if isMobileLandscape}
        <!-- Landscape layout: vertical tabs on the left and content on the right -->
        <div class="flex space-x-8 overflow-y-scroll">
          <ul class="flex flex-col space-y-4 text-lg tracking-[-0.07em]">
            <li>
              <button
                class="hover-blur"
                class:active={tab === "info"}
                on:click={() => (tab = "info")}
              >
                {t("info")}
              </button>
            </li>
            <li>
              <button
                class="hover-blur"
                class:active={tab === "about"}
                on:click={() => (tab = "about")}
              >
                {t("about")}
              </button>
            </li>
            <li>
              <button
                class="hover-blur"
                class:active={tab === "news"}
                on:click={() => (tab = "news")}
              >
                {t("news")}
              </button>
            </li>
          </ul>
          <div class="overflow-auto custom-scrollbar pl-4">
            {#if tab === "info"}
              <div class="relative">
                <div class="mb-6">
                  <slot name="info" />
                </div>
                <div class="sticky bottom-0 left-0 z-10 flex gap-2.5">
                  <a class="button" target="_blank" href={`/${lang}/faq/intro`}>FAQ</a>
                  <a class="button" target="_blank" href={`/${lang}/faq/support`}>Support</a>
                </div>
              </div>
            {:else if tab === "about"}
              <slot name="about" />
            {:else if tab === "news"}
              <slot name="news" />
            {/if}
          </div>
        </div>
      {:else}
        <!-- Portrait layout: horizontal tabs on top, content below -->
        <ul class="flex justify-between items-center pb-4 text-menu-languages">
          <li>
            <button
              class="hover-blur"
              class:active={tab === "info"}
              on:click={() => (tab = "info")}
            >
              {t("info")}
            </button>
          </li>
          <li>
            <button
              class="hover-blur"
              class:active={tab === "about"}
              on:click={() => (tab = "about")}
            >
              {t("about")}
            </button>
          </li>
          <li>
            <button
              class="hover-blur"
              class:active={tab === "news"}
              on:click={() => (tab = "news")}
            >
              {t("news")}
            </button>
          </li>
        </ul>
        <div class="overflow-auto custom-scrollbar">
          {#if tab === "info"}
            <div class="relative">
              <div class="mb-6">
                <slot name="info" />
              </div>
              <div class="sticky bottom-0 left-0 z-10 flex gap-2.5">
                <a class="button" target="_blank" href={`/${lang}/faq/intro`}>FAQ</a>
                <a class="button" target="_blank" href={`/${lang}/faq/support`}>Support</a>
              </div>
            </div>
          {:else if tab === "about"}
            <slot name="about" />
          {:else if tab === "news"}
            <slot name="news" />
          {/if}
        </div>
      {/if}
    </div>
  </div>
{/if}

<style>
  .active {
    filter: blur(1px);
  }
</style>