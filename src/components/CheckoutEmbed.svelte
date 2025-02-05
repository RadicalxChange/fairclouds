<script>
  import { onMount } from "svelte";
  import { loadStripe } from "@stripe/stripe-js";
  import { cartItems } from "../cartStore";

  export let PUBLIC_STRIPE_KEY;
  export let lang;
  export let origin;
  export let currentUser;
  let stripePromise;

  let cartItemsValue = cartItems.get();
  let loading = true;

  let stripeLineItems = [];
  let licensesData = [];

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
        tier: item.price.tier,
        stripe_price_id: item.price.price_id,
        directus_price_id: item.price.id,
      }));

    } catch (error) {
      console.error("Failed to load prices:", error);
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

  onMount(async () => {
    await loadPrices();
    await createCheckoutSession();
  });
</script>

{#if loading}
  <p>Loading...</p>
{/if}
<div id="checkout"></div>

<style>
  /* Your CSS here */
</style>
