<script>
  import { isCartOpen, cartItems } from "../cartStore";

  function toggleCart() {
    isCartOpen.set(!isCartOpen.get());
  }
</script>

<button on:click={toggleCart}>Cart</button>

{#if $isCartOpen}
  <aside
    class="absolute top-[110%] right-0 w-screen max-w-lg rounded-default shadow-cloud z-50 bg-primary p-4"
  >
    {#if Object.values($cartItems).length}
      {#each Object.values($cartItems) as cartItem}
        <li>
          <h3>{cartItem.name}</h3>
        </li>
      {/each}
      <a href="/en/checkout" class="button">Checkout</a>
    {:else}
      <p>Your cart is empty!</p>
    {/if}
  </aside>
{/if}
