import { atom } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

export const isCartOpen = atom(false);

export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  priceId: string;
  sort: number;
};

export type ItemDisplayInfo = Pick<CartItem, 'id' | 'name' | 'quantity' | 'priceId' | 'sort'>;

export const cartItems = persistentMap<Record<string, CartItem>>('cart:', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addCartItem({ id, name, quantity, priceId, sort }: ItemDisplayInfo) {
  const existingEntry = cartItems.get()[id];
  if (!existingEntry) {
    cartItems.setKey(
      id,
      { id, name, quantity, priceId, sort }
    );
  }
}

export function removeCartItem(itemId: string) {
  const cart = cartItems.get();
  if (cart[itemId]) {
    cartItems.setKey(itemId, undefined); // Remove the item by setting it to `undefined`
  }
}