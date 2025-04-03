<script>
  import { isCartOpen, cartItems, removeCartItem } from "../cartStore";
  import { createDialog, melt } from "@melt-ui/svelte";
  import { onMount } from "svelte";

  export let currentUser;

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
        alert(`One or more Cloudsteward Licenses you had in your cart are no longer available. You can still steward those clouds if you go back and select a different license. The following clouds will be removed from your cart: ${cloudNames}. Reload the page to make sure the listings are up-to-date.`);
      } else {
        // If all items are available, navigate to the checkout page.
        window.location.href = '/en/checkout';
      }
    } catch (error) {
      console.error("Cart validation failed", error);
      alert("There was an error validating your cart. Please try again later. If the problem persists, clear your session cache or contact support.");
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
    Cart / Checkout
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
        <h4>You currently have {Object.values($cartItems).length} cloud{Object.values($cartItems).length !== 1 ? "s" : ""} in your cart.</h4>
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
                    >Renewal Price</span
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
          <p>You must be logged in to checkout.</p>
        {:else}
          <button on:click={handleCheckout} class="button">Checkout</button>
        {/if}
      {:else}
        <p>Your cart is empty!</p>
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
