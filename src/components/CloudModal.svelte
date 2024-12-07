<script lang="ts">
  import { useTranslations } from "../i18n/utils";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { onMount } from "svelte";
  import { addCartItem, cartItems } from "../cartStore";

  export let lang: "en" | "es" = "en";
  export let cloud: number;
  export let currentUser;

  const {
    elements: { trigger, portalled, overlay, content },
    states: { open },
  } = createDialog();

  let t;

  // Slideshow logic
  let currentIndex = 0;
  let slideshowInterval;
  let drawings;

  $: (() => {
    // Fetch info for selected cloud
    if (cloud) {
      drawings = cloud.drawings;
      currentIndex = 0;
      startSlideshow();
      open.set(true);
    }
  })();

  function startSlideshow() {
    if (slideshowInterval) clearInterval(slideshowInterval);
    slideshowInterval = setInterval(() => {
      currentIndex = (currentIndex + 1) % drawings.length;
    }, 3000); // Change image every 3 seconds
  }

  function pauseSlideshow(index) {
    clearInterval(slideshowInterval);
    currentIndex = index;
  }

  function resumeSlideshow() {
    startSlideshow();
  }

  onMount(() => {
    t = useTranslations(lang);
  });

  function handleAddToCart() {
    cloud.quantity = 1;
    cloud.sort = cloud.licenses.length + 1;
    switch (cloud.licenses.length) {
      case 0:
        cloud.priceId = "price_1QPrPKI5tEqwxzqyJpFyuszU";
        break;
      case 1:
        cloud.priceId = "price_1QPrRnI5tEqwxzqyKxeuIdJ6";
        break;
      default:
        cloud.priceId = "price_1QPrSBI5tEqwxzqym5FzNxrG";
        break;
    }
    addCartItem(cloud);
  }

  function isCloudInCart(cloudId) {
    console.log(Object.values($cartItems));
    return Object.values($cartItems).some((item) => item.id === cloudId);
  }

  function getLicense(currentUser, cloudId) {
    if (!currentUser || !currentUser.licenses || !Array.isArray(currentUser.licenses)) {
      return null;
    }

    return currentUser.licenses.find(
      (license) => license.cloud_id && license.cloud_id.id === cloudId
    ) || null;
  }
</script>

{#if $open}
  <!-- Cloud Modal -->
  <div {...$portalled} use:portalled>
    <div
      class="fixed flex flex-col rounded-default bottom-20 right-4 z-50 max-h-[calc(100vh-175px)] w-full max-w-[610px] bg-primary shadow-cloud p-5 pt-2 focus:outline-none"
      {...$content}
      use:content
    >
      <div class="flex justify-between items-center mb-[30px]">
        <h3 class="text-heading">Cloud {cloud.name}</h3>
        <!-- <span
          class="bg-white text-primary text-copy rounded-full pl-[14px] pr-[7px] pt-1"
          >10$ *</span
        > -->
      </div>
      <p class="mb-[21px]">
        {currentUser && getLicense(currentUser, cloud.id) ? "You are Steward #" + getLicense(currentUser, cloud.id).sort : "Become a temporary steward"} of this cloud and the {cloud.drawings.length} drawing{cloud.drawings.length !== 1 ? "s" : ""} it
        contains.
      </p>
      <div class="mb-2.5 flex flex-wrap gap-2.5 w-full">
        {#each cloud.drawings as drawing, index}
          <img
            src={`https://cms.fairclouds.life/assets/` +
                drawing.image}
            alt={drawing.title}
            class="h-[45px] w-auto cursor-pointer"
            on:mouseenter={() => pauseSlideshow(index)}
            on:mouseleave={resumeSlideshow}
          />
        {/each}
      </div>
      <p class="mb-10 text-small">
        This cloud has {cloud.licenses.length} current steward{cloud.licenses.length !== 1 ? "s" : ""}. The initial cost of the licence is relative to
        the number of current stewards.
      </p>
      {#if isCloudInCart(cloud.id)}
        <button disabled class="button group w-fit cursor-not-allowed">
          In your cart
        </button>
      {:else}
        <button on:click={handleAddToCart} class="button group w-full max-w-[450px]">
          <span class="group-hover:hidden">Steward this cloud</span>
          <span class="hidden group-hover:block">Add to cart</span>
        </button>
      {/if}
    </div>
  </div>
  <!-- Slideshow Modal -->
  <div
    class="fixed hidden lg:flex flex-col rounded-default bottom-20 left-4 z-50 w-auto h-auto bg-primary shadow-cloud p-2 focus:outline-none"
  >
    {#if cloud.drawings.length > 0}
      <img
        src={`https://cms.fairclouds.life/assets/` + cloud.drawings[currentIndex].image}
        alt={cloud.drawings[currentIndex].title}
        class="object-contain"
        style="
          max-height: 65vh;
          width: auto;
          max-width: calc(100vw - 610px - 64px);"
      />
    {:else}
      <p>No drawings available.</p>
    {/if}
  </div>
{/if}

<style>
  .active {
    filter: blur(1px);
  }
</style>
