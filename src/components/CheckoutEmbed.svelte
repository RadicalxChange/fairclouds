<script>
  import { onMount } from "svelte";
  import { loadStripe } from "@stripe/stripe-js";
  import { cartItems } from "../cartStore";
  import { formatDate } from "../utils/format-date"

  export let PUBLIC_STRIPE_KEY;
  export let lang;
  export let origin;
  export let currentUser;
  let stripePromise;

  let cartItemsValue = cartItems.get();
  let loading = true;

  let stripeLineItems = [];
  let licensesData = [];
  let discounts = [];

  // Function to load or create Stripe prices
  async function loadPrices() {
    try {
      console.log("Getting or creating Stripe prices...");
      const response = await fetch("/api/get-prices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          cart_items: cartItemsValue,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      stripeLineItems = Object.values(data.prices).map((item) => ({
        price: item.price.price_id,
        quantity: item.quantity,
      }));
      
      licensesData = Object.values(data.prices).map((item) => ({
        cloud: item.name,
        cycle: item.price.cycle_id.name,
        expiry: item.price.cycle_id.end_date,
        tier: item.price.tier,
        stripe_price_id: item.price.price_id,
        directus_price_id: item.price.id,
      }));

    } catch (error) {
      console.error("Failed to load prices:", error);
    }
  }

  // Apply any Cloudsteward Credits the user may have
  async function applyStoreCredits() {
    if (currentUser.credits > 0) {
      try {
        console.log("Creating Stripe coupon...");
        const response = await fetch("/api/create-coupon", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            credits: currentUser.credits,
          }),
        });

        if (!response.ok) {
          throw new Error("Network response was not ok");
        }

        const data = await response.json();

        discounts.push({
          coupon: data.coupon.id,
        })

      } catch (error) {
        console.error("Failed to create coupon:", error);
      }
    }
  }

  async function createCheckoutSession() {
    try {
      const response = await fetch("/api/checkout-session", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          line_items: stripeLineItems,
          origin: origin,
          lang: lang,
          current_user: currentUser,
          license_data: licensesData,
          discounts: discounts,
        }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();

      const stripe = await loadStripe(PUBLIC_STRIPE_KEY);
      if (stripe !== null) {
        const checkout = await stripe.initEmbeddedCheckout({
          fetchClientSecret: () => Promise.resolve(data.clientSecret),
        });
        // Mount Checkout
        checkout.mount("#checkout");
        loading = false;
      } else {
        // Handle the case where stripe is null
        console.error("Stripe failed to initialize");
        loading = false;
      }
    } catch (error) {
      console.error("Failed to create checkout session:", error);
      loading = false;
    }
  }

  // Helper function: Group licenses by expiry date
  function groupLicensesByExpiry(licenses) {
    return licenses.reduce((groups, license) => {
      const expiry = license.expiry;
      if (!groups[expiry]) {
        groups[expiry] = [];
      }
      groups[expiry].push(license.cloud);
      return groups;
    }, {});
  }

  // Reactive statement to update grouped licenses when licensesData changes
  $: groupedLicenses = groupLicensesByExpiry(licensesData);

  function joinCloudNames(items) {
    if (items.length === 0) return "";
    if (items.length === 1) return items[0];
    if (items.length === 2) return items.join(" and ");
    return items.slice(0, items.length - 1).join(", ") + ", and " + items[items.length - 1];
  }

  onMount(async () => {
    await loadPrices();
    await applyStoreCredits();
    await createCheckoutSession();
  });
</script>
<div>
  <div class="max-w-[888px] mx-auto space-y-4">
    {#if loading}
      <p>Loading...</p>
    {:else}
      <h1>Checkout</h1>
      <p>During your stewardship, you will be able to download the digital artworks associated with the clouds listed below and use the artworks within <a class="underline" target="_blank" href={`/${lang}/faq/what-is-a-cloudsteward-licence/`}>these terms</a>.</p>
      {#if licensesData && licensesData.length > 0}
        <p>With this purchase:</p>
        <ul class="pl-4">
          {#each Object.entries(groupedLicenses) as [expiry, clouds]}
            <li class="before:pr-4 before:content-['-']">
              <span class="font-sans">you will be steward of {joinCloudNames(clouds)} until {formatDate(expiry)}</span>
            </li>
          {/each}
        </ul>
        <p>You will be notified by email when these licenses are eligible to be renewed. Renewal is half-off the listing price.</p>
      {/if}
    {/if}
  </div>
  <div
    id="checkout"
    class="mt-8"
  >
  </div>
</div>

<style>
  /* Your CSS here */
</style>
