<script>
    import { addCartItem, cartItems, isCartOpen } from "../cartStore";
    import { formatDate } from "../utils/format-date";

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
    $: enableButton = renewalActive && renewalPrice && !license.renewed && !license.claimed;

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

<div class="my-4">
    {#if isInCart}
        <button on:click={handleOpenCart} class="button group w-fit">
            View your cart
        </button>
    {:else}
        {#if !enableButton}
            {#if license.renewed}
                <p>You successfully renewed this stewardship license.</p>
            {:else if license.claimed}
                <p>Someone else took over stewardship of this cloud.</p>
            {:else if new Date(license.price_id.cycle_id.end_date) < new Date()}
                <p>This stewardship license has expired.</p>
            {:else}
                <p>You will be able to renew your stewardship starting on {formatDate(license.price_id.cycle_id.renewal_start_date)}</p>
            {/if}
        {:else}
            <p>You have until {formatDate(license.price_id.cycle_id.end_date)} to renew your stewardship.</p>
            {#if license.price_id.cycle_id.prices_status === "active"}
                <p>You have the right of first refusal until {formatDate(license.price_id.cycle_id.transition_start_date)}, after which stewardship will be first-come-first-serve.</p>
            {:else}
                <p class="mt-2">Stewardship is first-come-first-serve.</p>
            {/if}
        {/if}
        <button
            on:click={handleAddToCart(license.price_id.cloud_id, renewalPrice)}
            disabled={!enableButton}
            class="button group max-w-[450px] mt-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-cloud">
            <span>Renew</span>
        </button>
    {/if}
</div>