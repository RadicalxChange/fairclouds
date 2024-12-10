import { atom } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

export const isCartOpen = atom(false);

export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  price: any;
  tier: number;
  drawings: any;
};

export type ItemDisplayInfo = Pick<CartItem, 'id' | 'name' | 'quantity' | 'price' | 'tier' | 'drawings'>;

export const cartItems = persistentMap<Record<string, CartItem>>('cart:', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addCartItem({ id, name, quantity, price, tier, drawings }: ItemDisplayInfo) {
  const existingEntry = cartItems.get()[id];
  if (existingEntry) {
    removeCartItem(existingEntry.id)
  }
  cartItems.setKey(
    id,
    { id, name, quantity, price, tier, drawings }
  );
}

export function removeCartItem(itemId: string) {
  const cart = cartItems.get();
  if (cart[itemId]) {
    cartItems.setKey(itemId, undefined); // Remove the item by setting it to `undefined`
  }
}

export function clearCart() {
  console.log("cartStore:", cartItems.get())
  cartItems.set({});
}