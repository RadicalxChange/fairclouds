<script>
  import { addCartItem, isCartOpen } from "../cartStore";

  // we'll hardcode the item info for simplicity!
  const hardcodedItemInfo = {
    priceId: "price_1Pcq6cI5tEqwxzqyzC83tnJ0",
    name: "License cycle phase 2",
    quantity: 1,
  };

  function addToCart() {
    isCartOpen.set(true);
    addCartItem(hardcodedItemInfo);
  }
</script>

<form on:submit|preventDefault={addToCart}>
  <button type="submit">Add to cart</button>
</form>
