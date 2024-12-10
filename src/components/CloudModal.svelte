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

  // Slideshow variables
  let currentIndex = 0;
  let slideshowInterval;
  let drawings;

  // Price variables
  let prices;
  let selectedPriceId = null;

  // Watch cloud changes
  $: if (cloud) {
      handleCloudChange();
    }

  async function handleCloudChange() {
    // Fetch info for the selected cloud
    drawings = cloud.drawings;
    currentIndex = 0;
    startSlideshow();
    prices = await loadPrices(cloud.product_id);

    // Preselect price if cloud is already in the cart
    const cartItem = Object.values($cartItems).find((item) => item.id === cloud.id);
    if (cartItem && cartItem.price) {
      selectedPriceId = cartItem.price.id;
    } else {
      selectedPriceId = null;
    }
    open.set(true);
  }

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
    if (!selectedPriceId) {
      alert("Please select a license before adding to cart.");
      return;
    }
    cloud.quantity = 1;

    const priceIndex = prices.findIndex((price) => price.id === selectedPriceId);
    if (priceIndex !== -1) {
      cloud.price = prices[priceIndex];
      cloud.tier = priceIndex + 1;
    } else {
      console.error("Selected price not found in the prices array.");
      return;
    }
    addCartItem(cloud);
  }

  $: isCloudInCart = Object.values($cartItems).some(
    (item) => item.id === cloud.id && item.price.id === selectedPriceId
  );

  function getLicense(currentUser, cloudId) {
    if (!currentUser || !currentUser.licenses || !Array.isArray(currentUser.licenses)) {
      return null;
    }

    return currentUser.licenses.find(
      (license) => license.cloud_id && license.cloud_id.id === cloudId
    ) || null;
  }

  async function loadPrices(productId) {
    try {
      console.log("loading prices for this cloud...");
      const response = await fetch("/api/get-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          product_id: productId,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      return data.prices.data.sort((a, b) => a.unit_amount - b.unit_amount)

    } catch (error) {
      console.error("Failed to load prices:", error);
      loading = false;
    }
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
        <span
          class="bg-white text-primary text-copy rounded-full pl-[14px] pr-[7px] pt-1"
          >{cloud.licenses.length} steward{cloud.licenses.length !== 1 ? "s" : ""}</span
        >
      </div>
      <p class="mb-[21px]">
        {currentUser && getLicense(currentUser, cloud.id) ? "You hold License " + getLicense(currentUser, cloud.id).tier : "Become a temporary steward"} of this cloud and the {cloud.drawings.length} drawing{cloud.drawings.length !== 1 ? "s" : ""} it
        contains.
      </p>
      <div class="mb-[21px] flex flex-wrap gap-2.5 w-full">
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

      <!-- Dropdown for Prices -->
      {#if prices && prices.length > 0}
        <div class="mb-[21px]">
          <select
            id="license-prices"
            class="block w-full py-2 px-4 leading-8 bg-white text-[#72AEE9] rounded-md shadow-sm appearance-none focus:ring-primary focus:border-primary"
            style="background-color: #ffffff; background: url('/icons/down-arrow.svg') no-repeat right 1rem center, #ffffff; background-size: 1rem;"
            bind:value={selectedPriceId}
            >
            <option disabled value={null}>
              Current Licenses Available
            </option>
            {#each prices as price, i}
              <option value={price.id} disabled={!price.active}>
                License {i + 1} - {price.currency.toUpperCase()} {(price.unit_amount / 100).toFixed(2)} {!price.active ? "(Stewarded)" : ""}
              </option>
            {/each}
          </select>
        </div>      
      {:else}
        <p class="text-sm text-white mb-4">No licenses available at this time.</p>
      {/if}

      <!-- Add to cart button -->
      {#if isCloudInCart}
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
