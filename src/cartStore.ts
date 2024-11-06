import { atom } from 'nanostores';
import { persistentMap } from '@nanostores/persistent';

export const isCartOpen = atom(false);

export type CartItem = {
  id: string;
  name: string;
  quantity: number;
  priceId: string; // Added priceId attribute
};

export type ItemDisplayInfo = Pick<CartItem, 'id' | 'name' | 'quantity' | 'priceId'>;

export const cartItems = persistentMap<Record<string, CartItem>>('cart:', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});

export function addCartItem({ id, name, quantity, priceId }: ItemDisplayInfo) {
  const existingEntry = cartItems.get()[id];
  if (!existingEntry) {
    cartItems.setKey(
      id,
      { id, name, quantity, priceId } // Added priceId attribute
    );
  }
}