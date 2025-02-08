<script>
  import { isCartOpen, cartItems, removeCartItem } from "../cartStore";
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
      class="fixed flex flex-col rounded-default bottom-20 right-4 z-50 max-h-[calc(100vh-175px)] w-full max-w-[610px] bg-primary shadow-cloud p-5 focus:outline-none"
      {...$content}
      use:content
    >
      {#if Object.values($cartItems).length}
        <h3 class="mb-2.5">You currently have {Object.values($cartItems).length} cloud{Object.values($cartItems).length !== 1 ? "s" : ""} in your shopping basket.</h3>
        <ul class="mb-2.5 my-4">
          {#each Object.values($cartItems) as cartItem}
            <li class="flex flex-row justify-between my-4">
              <div>
                <h3 class="inline-block mr-4">Cloud {cartItem.name} - License {cartItem.price.tier}</h3>
                {#if cartItem.price.isRenewalPrice}
                  <span
                    class="bg-white text-primary text-copy rounded-full pl-[7px] pr-[7px] pt-1 inline-block mr-4"
                    >€ {(cartItem.price.isRenewalPrice ? Math.round((cartItem.price.amount / 2) * 100) / 100 : cartItem.price.amount).toFixed(2)}</span
                  >
                  <span
                    class="inline-block"
                    >Renewal Price</span
                  >
                {:else}
                  <span
                    class="bg-white text-primary text-copy rounded-full pl-[7px] pr-[7px] pt-1 inline-block"
                    >€ {cartItem.price.amount.toFixed(2)}</span
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
                class="text-red-500 hover:text-red-700 focus:outline-none mb-auto ml-2" 
                on:click={() => removeCartItem(cartItem.id)}
              >
                Delete
              </button>
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
