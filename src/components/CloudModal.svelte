<script lang="ts">
  import { useTranslations, capitalizeFirstLetter } from "../i18n/utils";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { onMount } from "svelte";
  import { addCartItem, cartItems, isCartOpen } from "../cartStore";

  export let cloud;
  export let currentUser;
  export let lang: "en" | "es" = "en";

  $: t = useTranslations(lang);

  const {
    elements: { trigger, portalled, overlay, content },
    states: { open },
  } = createDialog();

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

  $: isCloudInCart = Object.values($cartItems).some(
    (item) => cloud ? item.id === cloud.id && item.price.id === selectedPriceId : false
  );
  async function handleCloudChange() {
    // Fetch info for the selected cloud
    drawings = cloud.drawings;
    currentIndex = cloud.activeDrawingIndex;
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

  function handleAddToCart() {
    if (!selectedPriceId) {
      alert(t("select_a_license_alert"));
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

  function handleOpenCart() {
    open.set(false);
    isCartOpen.set(true);
  }

  function getLicense(currentUser, cloudId) {
    if (!currentUser || !currentUser.licenses || !Array.isArray(currentUser.licenses)) {
      return null;
    }

    return currentUser.licenses.find(
      (license) => license.price_id.cloud_id === cloudId && license.price_id.cycle_id.prices_status === "active"
    ) || null;
  }
</script>

{#if $open}
  <!-- Cloud Modal -->
  <div {...$portalled} use:portalled>
    <div
      class="modal bg-primary cloud-modal bottom-[4rem]"
      {...$content}
      use:content
    >
      <div class="cloud-modal-header items-start">
        <p>
          {currentUser && getLicense(currentUser, cloud.id) ? t("you_are") + " Cloudsteward " + getLicense(currentUser, cloud.id).price_id.tier : t("become_a_steward")} {t("of_this_cloud_and_all")} {cloud.drawings.length} {t("drawing")}{cloud.drawings.length !== 1 ? "s" : ""}{t("it_contains")}
        </p>
        <div class="bg-white text-primary text-center text-copy whitespace-nowrap rounded-full px-[10px] pt-1">
          <span>{numStewards} Cloudsteward{numStewards !== 1 ? "s" : ""}</span>
        </div>
      </div>
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
            class="block w-full py-1 sm:py-2 px-4 leading-8 bg-white text-primary rounded-md shadow-sm appearance-none focus:ring-primary focus:border-primary"
            style="background-color: #ffffff; background: url('/icons/down-arrow.svg') no-repeat right 1rem center, #ffffff; background-size: 1rem;"
            bind:value={selectedPriceId}
            >
            <option disabled value={null}>
              {t("current_licenses_available")}
            </option>
            {#each prices as price}
              {#if price.isRenewalPrice}
                <option value={price.id}>
                  Cloudsteward {price.tier} - € {(Math.round((parseFloat(price.amount) / 2) * 100) / 100).toFixed(2)} {t("renew_your_current_license")}
                </option>
              {:else}
                <option value={price.id} disabled={price.licenses && price.licenses.length !== 0}>
                  Cloudsteward {price.tier} - € {price.amount}
                </option>
              {/if}
            {/each}
          </select>
        </div>      
      {:else}
        <p class="text-white mb-4">{t("no_licenses_available")}.</p>
      {/if}

      <div class="cloud-modal-header items-center">
        <!-- Add to cart button -->
        {#if prices && prices.length > 0}
          {#if isCloudInCart}
            <button on:click={handleOpenCart} class="button group w-fit">
              {t("view_your_cart")}
            </button>
          {:else}
            {#if !currentUser}
              <p>{t("must_be_logged_in")} {t("steward_this_cloud")}.</p>
            {:else}
              <button on:click={handleAddToCart} class="button group max-w-[450px]">
                <span>{capitalizeFirstLetter(t("steward_this_cloud"))}</span>
              </button>
            {/if}
          {/if}
        {/if}
        <a class="icon-button" target="_blank" href={`/${lang}/faq/becoming-a-cloudsteward`}>
          <span class="text-xl sm:text-3xl pt-[4px]">i</span>
        </a>
      </div>
    </div>
  </div>
  <!-- Slideshow Modal -->
  <div
    class="fixed hidden lg:flex flex-col rounded-default bottom-[4rem] left-4 z-50 w-auto h-auto bg-primary shadow-cloud px-1 pt-1 focus:outline-none"
  >
    {#if cloud.drawings.length > 0}
      <img
        src={`https://cms.fairclouds.life/assets/` + cloud.drawings[currentIndex].image}
        alt={cloud.drawings[currentIndex].title}
        class="object-contain rounded-default"
        style="
          max-height: 65vh;
          width: auto;
          max-width: calc(100vw - 610px - 64px);"
      />
      <p class="whitespace-nowrap text-white text-xs m-2">
        {t("drawn_by")} {cloud.drawings[currentIndex].author ?
          cloud.drawings[currentIndex].author :
          (cloud.drawings[currentIndex].first_name || cloud.drawings[currentIndex].last_name ?
            cloud.drawings[currentIndex].first_name + " " + cloud.drawings[currentIndex].last_name :
            "anon")}{cloud.drawings[currentIndex].location ? ", " + cloud.drawings[currentIndex].location : ""}
      </p>
    {:else}
      <p>{t("no_drawings")}.</p>
    {/if}
  </div>
{/if}

<style>
  .active {
    filter: blur(1px);
  }
</style>
