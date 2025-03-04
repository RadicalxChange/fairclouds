<script lang="ts">
  import { useTranslations } from "../i18n/utils";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { onMount } from "svelte";
  import { addCartItem, cartItems } from "../cartStore";

  export let lang: "en" | "es" = "en";
  export let cloud;
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

  // Current number of stewards
  let numStewards;
  
  // Watch cloud changes
  $: if (cloud) {
      handleCloudChange();
    }

  async function handleCloudChange() {
    // Fetch info for the selected cloud
    drawings = cloud.drawings;
    currentIndex = 0;
    startSlideshow();
    prices = cloud.prices.sort((a, b) => a.tier - b.tier);
    numStewards = countStewards(prices);

    // Preselect price if cloud is already in the cart
    const cartItem = Object.values($cartItems).find((item) => item.id === cloud.id);
    if (cartItem && cartItem.price) {
      selectedPriceId = cartItem.price.id;
    } else {
      selectedPriceId = null;
    }
    open.set(true);
  }

  function countStewards(prices) {
    return prices.reduce((count, price) => {
      // Check if the price has a non-empty licenses array.
      if (price.licenses && price.licenses.length > 0) {
        return count + 1;
      }
      return count;
    }, 0);
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

    const selectedPrice = prices.find((price) => price.id === selectedPriceId);
    if (selectedPrice) {
      cloud.price = selectedPrice;
    } else {
      console.error("Selected price not found in the prices array.");
      return;
    }
    addCartItem(cloud);
  }

  $: isCloudInCart = Object.values($cartItems).some(
    (item) => cloud ? item.id === cloud.id && item.price.id === selectedPriceId : false
  );

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
      class="modal cloud-modal bottom-[4rem]"
      {...$content}
      use:content
    >
      <div class="cloud-modal-header">
        <h3>Cloud {cloud.name}</h3>
        <span
          class="bg-white text-primary text-center text-copy rounded-full px-[10px] pt-1"
          >{numStewards} Cloudkeeper{numStewards !== 1 ? "s" : ""}</span
        >
      </div>
      <p>
        {currentUser && getLicense(currentUser, cloud.id) ? "You hold License " + getLicense(currentUser, cloud.id).tier : "Become a keeper"} of this cloud and the {cloud.drawings.length} drawing{cloud.drawings.length !== 1 ? "s" : ""} it
        contains.
      </p>
      <div class="flex flex-wrap gap-2.5 w-full overflow-y-auto custom-scrollbar pr-2 sm:pr-0">
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
        <div>
          <select
            id="license-prices"
            class="block w-full py-1 sm:py-2 px-4 leading-8 bg-white text-[#72AEE9] rounded-md shadow-sm appearance-none focus:ring-primary focus:border-primary"
            style="background-color: #ffffff; background: url('/icons/down-arrow.svg') no-repeat right 1rem center, #ffffff; background-size: 1rem;"
            bind:value={selectedPriceId}
            >
            <option disabled value={null}>
              Current Licenses Available
            </option>
            {#each prices as price}
              {#if price.isRenewalPrice}
                <option value={price.id}>
                  License {price.tier} - € {(Math.round((parseFloat(price.amount) / 2) * 100) / 100).toFixed(2)} Renew your current license
                </option>
              {:else}
                <option value={price.id} disabled={price.licenses && price.licenses.length !== 0}>
                  License {price.tier} - € {price.amount} {price.licenses && price.licenses.length !== 0 ? "(Claimed)" : ""}
                </option>
              {/if}
            {/each}
          </select>
        </div>      
      {:else}
        <p class="text-white mb-4">No licenses available at this time.</p>
      {/if}

      <div class="cloud-modal-header">
        <!-- Add to cart button -->
        {#if isCloudInCart}
          <button disabled class="button group w-fit cursor-not-allowed">
            In your cart
          </button>
        {:else}
          <button on:click={handleAddToCart} class="button group max-w-[450px]">
            <span>Keep this cloud</span>
          </button>
        {/if}
        <a class="icon-button" target="_blank" href={`/${lang}/wiki/faq`}>
          <span class="text-xl sm:text-3xl pt-[4px]">i</span>
        </a>
      </div>
    </div>
  </div>
  <!-- Slideshow Modal -->
  <div
    class="fixed hidden lg:flex flex-col rounded-default bottom-[4rem] left-4 z-50 w-auto h-auto bg-primary shadow-cloud p-2 focus:outline-none"
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
