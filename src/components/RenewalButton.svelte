<script>
    import { addCartItem, cartItems, isCartOpen } from "../cartStore";

    // Props received from the parent component.
    export let license;
    export let renewalPrices = [];
  
    // Determine if renewal is available for this license.
    $: renewalActive = license.price_id?.cycle_id?.renewal_active;
  
    // Find a matching renewal price based on cloud id and tier.
    $: renewalPrice = renewalPrices.find(
      price =>
        price.cloud_id.id === license.price_id.cloud_id.id &&
        price.tier === license.price_id.tier
    );
  
    // Decide whether to show the renewal button.
    $: showButton = renewalActive && renewalPrice;

    // Check whether the renewal license is already in cart.
    $: isInCart = Object.values($cartItems).some(
        (item) => license && item.id === license.price_id.cloud_id.id
    );

    function handleAddToCart(cloud, renewalPrice) {
        addCartItem({
            ...cloud,
            quantity: 1,
            price: renewalPrice
        });
    };

    function handleOpenCart() {
        isCartOpen.set(true);
    };
</script>

{#if showButton}
    <div class="my-4">
        {#if isInCart}
            <button on:click={handleOpenCart} class="button group w-fit">
                View your cart
            </button>
        {:else}
            <button on:click={handleAddToCart(license.price_id.cloud_id, renewalPrice)} class="button group max-w-[450px]">
                <span>Renew</span>
            </button>
        {/if}
    </div>
{/if}  