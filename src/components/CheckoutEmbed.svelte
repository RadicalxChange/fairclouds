<script>
  import { onMount } from "svelte";
  import { loadStripe } from "@stripe/stripe-js";
  import { cartItems } from "../cartStore";

  export let PUBLIC_STRIPE_KEY;
  export let lang;
  export let origin;
  export let currentUser;
  let stripePromise;
  const cartItemsValue = cartItems.get();
  let loading = true;

  const stripeLineItems = Object.values(cartItemsValue).map((item) => ({
    price: item.priceId,
    quantity: item.quantity,
  }));
  
  const licensesData = Object.values(cartItemsValue).map((item) => ({
    cloud_id: item.id,
    sort: item.sort,
  }));

  onMount(async () => {
    stripePromise = loadStripe(PUBLIC_STRIPE_KEY);
    const stripe = await stripePromise;
    // Assuming you have a function to create a session or you might directly use stripe here
    await createCheckoutSession();
  });

  // Define your createCheckoutSession function here, if needed
  async function createCheckoutSession() {
    try {
      console.log("sending request to api");
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
</script>

{#if loading}
  <p>Loading...</p>
{/if}
<div id="checkout"></div>

<style>
  /* Your CSS here */
</style>
