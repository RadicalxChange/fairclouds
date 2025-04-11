<script lang="ts">
  import { isCartOpen, cartItems, removeCartItem } from "../cartStore";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { onMount } from "svelte";
  import { useTranslations } from "../i18n/utils";

  export let currentUser;
  export let lang: "en" | "es" = "en";

  $: t = useTranslations(lang);

  const {
    elements: { trigger, portalled, overlay, content },
    states: { open },
  } = createDialog();

  // Subscribe to the shared cart open state: when it's set to true, open the dialog.
  onMount(() => {
    const unsubscribe = isCartOpen.listen((value) => {
      if (value) {
        open.set(true);
      }
    });
    return () => unsubscribe();
  });

  // When the dialog is closed (open becomes false), update isCartOpen to false.
  $: if (!$open && $isCartOpen) {
    isCartOpen.set(false);
  }

  async function handleCheckout() {
    try {
      // Check if any cart items are no longer available.
      const response = await fetch('/api/cart-check', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ data: Object.values($cartItems) })
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const result = await response.json();
      
      if (result.claimedItems && result.claimedItems.length > 0) {
        const cloudNames = result.claimedItems.map(item => item.name).join(', ');
        result.claimedItems.forEach(item => {
          removeCartItem(item.id);
        });
        alert(t("license_not_available_alert_pt1") + cloudNames + t("license_not_available_alert_pt2"));
      } else {
        // If all items are available, navigate to the checkout page.
        window.location.href = `/${lang}/checkout`;
      }
    } catch (error) {
      console.error("Cart validation failed", error);
      alert(t("cart_validation_failed_alert"));
    }
  }
</script>

<div class="has-hint relative">
  <button class="icon-button" {...$trigger} use:trigger>
    <img src="/icons/cart.svg" alt="" />
    {#if Object.values($cartItems).length}
      <div
        class="cart-count absolute top-[56.25%] left-[49.25%] transform -translate-x-1/2 -translate-y-1/2 w-[14px] h-[11px]"
      ></div>
      <span
        class="text-small text-primary absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[14px] h-[11px]"
        >{Object.values($cartItems).length}</span
      >
    {/if}
  </button>

  <div role="tooltip" class="hint top-[0%] -mt-7 right-0 w-max">
    {t("cart_checkout_tooltip")}
  </div>
</div>

{#if $open}
  <div {...$portalled} use:portalled>
    <div
      class="modal bg-primary bottom-[4rem]"
      {...$content}
      use:content
    >
      {#if Object.values($cartItems).length}
        <h4>{t("you_currently_have")} {Object.values($cartItems).length} {t("cloud")}{Object.values($cartItems).length !== 1 ? "s" : ""} {t("in_your_cart")}.</h4>
        <ul class="cart-items overflow-y-auto custom-scrollbar pr-2 sm:pr-0">
          {#each Object.values($cartItems) as cartItem}
            <li class="flex flex-row justify-between">
              <div>
                <h4 class="inline-block mr-4">{cartItem.name} - Cloudsteward {cartItem.price.tier}</h4>
                {#if cartItem.price.isRenewalPrice}
                  <span
                    class="bg-white text-primary text-copy rounded-full pl-[7px] pr-[7px] pt-1 inline-block mr-4"
                    >€ {cartItem.price.isRenewalPrice ? (Math.round((parseFloat(cartItem.price.amount) / 2) * 100) / 100).toFixed(2) : cartItem.price.amount}</span
                  >
                  <span
                    class="inline-block"
                    >{t("renewal_price")}</span
                  >
                {:else}
                  <span
                    class="bg-white text-primary text-copy rounded-full pl-[7px] pr-[7px] pt-1 inline-block"
                    >€ {cartItem.price.amount}</span
                  >
                {/if}
                <div class="mb-2.5 flex flex-wrap gap-2.5 w-full pt-2">
                  {#each cartItem?.drawings || [] as drawing, index}
                    {#if drawing?.image}
                      <img
                        src={`https://cms.fairclouds.life/assets/` +
                            drawing.image}
                        alt={drawing.title}
                        class="h-[45px] w-auto"
                      />
                    {/if}
                  {/each}
                </div>
              </div>
              <button 
                class="hover:opacity-75 focus:outline-none mb-auto ml-2 hover:shadow-none" 
                on:click={() => removeCartItem(cartItem.id)}
              >
                <img src="/icons/delete.svg" alt="Delete Icon" class="h-7 w-7" />
              </button>
            </li>
          {/each}
        </ul>
        {#if !currentUser}
          <p>{t("must_be_logged_in")} {t("check_out")}.</p>
        {:else}
          <button on:click={handleCheckout} class="button">{t("checkout")}</button>
        {/if}
      {:else}
        <p>{t("cart_empty")}</p>
      {/if}
    </div>
  </div>
{/if}

<style>
  .cart-count {
    background-image: url("/icons/cloud.svg");
    background-size: cover;
    background-position: center;
  }
</style>
