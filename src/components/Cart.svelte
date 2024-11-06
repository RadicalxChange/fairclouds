<script>
  import { isCartOpen, cartItems } from "../cartStore";
  import { createDialog, melt } from "@melt-ui/svelte";

  const {
    elements: { trigger, portalled, overlay, content },
    states: { open },
  } = createDialog();

  $: (() => {
    // open dialog programmatically
    open;
    console.log("open", open);
  })();
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
    Basket / Checkout
  </div>
</div>

{#if $open}
  <div {...$portalled} use:portalled>
    <div
      class="fixed flex flex-col rounded-default bottom-20 right-4 z-50 max-h-[calc(100vh-175px)] w-full max-w-[610px] bg-primary shadow-cloud p-5 pt-2 focus:outline-none"
      {...$content}
      use:content
    >
      <h3 class="mb-2.5">Cart</h3>
      {#if Object.values($cartItems).length}
        <ul class="mb-2.5">
          {#each Object.values($cartItems) as cartItem}
            <li>
              <h3>{cartItem.name}</h3>
            </li>
          {/each}
        </ul>
        <a href="/en/checkout" class="button">Checkout</a>
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
