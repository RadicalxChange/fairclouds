<script lang="ts">
    import { addCartItem, cartItems, isCartOpen } from "../cartStore";
    import { formatDate } from "../utils/format-date";
    import { useTranslations } from "../i18n/utils";

    // Props received from the parent component.
    export let license;
    export let renewalPrices = [];
    export let lang: "en" | "es" = "en";

    $: t = useTranslations(lang);
  
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
            {t("view_your_cart")}
        </button>
    {:else}
        {#if !enableButton}
            {#if license.renewed}
                <p>{t("successfully_renewed")}</p>
            {:else if license.claimed}
                <p>{t("stewardship_passed")}</p>
            {:else if new Date(license.price_id.cycle_id.end_date) < new Date()}
                <p>{t("license_expired")}</p>
            {:else}
                <p>{t("renewal_available_on")} {formatDate(license.price_id.cycle_id.renewal_start_date)}</p>
            {/if}
        {:else}
            <p>{t("you_have")} {t("until")} {formatDate(license.price_id.cycle_id.end_date)} {t("to_renew")}</p>
            {#if license.price_id.cycle_id.prices_status === "active"}
                <p>{t("right_of_first_refusal_until")} {formatDate(license.price_id.cycle_id.transition_start_date)}, {t("after_which")}</p>
            {:else}
                <p class="mt-2">{t("first_come_first_serve")}</p>
            {/if}
        {/if}
        <button
            on:click={handleAddToCart(license.price_id.cloud_id, renewalPrice)}
            disabled={!enableButton}
            class="button group max-w-[450px] mt-4 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:shadow-cloud">
            <span>{t("renew")}</span>
        </button>
    {/if}
</div>