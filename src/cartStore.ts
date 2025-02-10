import { atom } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

export const isCartOpen = atom(false);

export type CartItem = {
  id: string;
  name: string;
  product_id: string;
  quantity: number;
  price: any;
  drawings: any;
};

export type ItemDisplayInfo = Pick<CartItem, 'id' | 'name' | 'product_id' | 'quantity' | 'price' | 'drawings'>;

export const cartItems = persistentMap<Record<string, CartItem>>('cart:', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addCartItem({ id, name, product_id, quantity, price, drawings }: ItemDisplayInfo) {
  const existingEntry = cartItems.get()[id];
  if (existingEntry) {
    removeCartItem(existingEntry.id)
  }
  cartItems.setKey(
    id,
    { id, name, product_id, quantity, price, drawings }
  );
}

export function removeCartItem(itemId: string) {
  const cart = cartItems.get();
  if (cart[itemId]) {
    cartItems.setKey(itemId, undefined); // Remove the item by setting it to `undefined`
  }
}

export function clearCart() {
  cartItems.set({});
}