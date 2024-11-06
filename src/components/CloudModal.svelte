<script lang="ts">
  import { useTranslations } from "../i18n/utils";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { onMount } from "svelte";
  import { addCartItem, cartItems } from "../cartStore";

  export let lang: "en" | "es" = "en";
  export let cloud: number;

  const {
    elements: { trigger, portalled, overlay, content },
    states: { open },
  } = createDialog();

  let t;

  $: (() => {
    //fetch info for selected cloud

    // open dialog programmatically
    if (cloud) open.set(true);
  })();

  onMount(() => {
    t = useTranslations(lang);
  });

  function handleAddToCart() {
    cloud.quantity = 1;
    cloud.priceId = "price_1Pcq65I5tEqwxzqyI35xSvI0";
    addCartItem(cloud);
  }

  function isCloudInCart(cloudId) {
    console.log(Object.values($cartItems));
    return Object.values($cartItems).some((item) => item.id === cloudId);
  }
</script>

{#if $open}
  <div {...$portalled} use:portalled>
    <div
      class="fixed flex flex-col rounded-default bottom-20 right-4 z-50 max-h-[calc(100vh-175px)] w-full max-w-[610px] bg-primary shadow-cloud p-5 pt-2 focus:outline-none"
      {...$content}
      use:content
    >
      <div class="flex justify-between items-center mb-[30px]">
        <h3 class="text-heading">Cloud {cloud.name}</h3>
        <span
          class="bg-white text-primary text-copy rounded-full pl-[14px] pr-[7px] pt-1"
          >10$ *</span
        >
      </div>
      <p class="mb-[21px]">
        Become a temporary steward of this cloud and the XX drawing(s) it
        contains.
      </p>
      <div class="mb-2.5 flex gap-2.5">
        <img
          src="/drawing-placeholder.jpg"
          alt="alt of drawing to go here"
          class="h-[45px] w-auto"
        />
        <img
          src="/drawing-placeholder.jpg"
          alt="alt of drawing to go here"
          class="h-[45px] w-auto"
        />
        <img
          src="/drawing-placeholder.jpg"
          alt="alt of drawing to go here"
          class="h-[45px] w-auto"
        />
        <img
          src="/drawing-placeholder.jpg"
          alt="alt of drawing to go here"
          class="h-[45px] w-auto"
        />
        <img
          src="/drawing-placeholder.jpg"
          alt="alt of drawing to go here"
          class="h-[45px] w-auto"
        />
      </div>
      <p class="mb-10 text-small">
        *XX current stewards. The initial cost of the licence is relative to of
        the number of current stewards.
      </p>
      {#if isCloudInCart(cloud.id)}
        <button disabled class="button group w-fit cursor-not-allowed">
          In your cart
        </button>
      {:else}
        <button on:click={handleAddToCart} class="button group w-fit">
          <span class="group-hover:hidden">Steward this cloud</span>
          <span class="hidden group-hover:block">Add to cart</span>
        </button>
      {/if}

      <!-- Add to Cart Button -->
    </div>
  </div>
{/if}

<style>
  .active {
    filter: blur(1px);
  }
</style>
