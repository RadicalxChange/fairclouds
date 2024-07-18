import { atom } from 'nanostores';
import { persistentMap } from '@nanostores/persistent'

export const isCartOpen = atom(false);

export type CartItem = {
  priceId: string;
  name: string;
  quantity: number;
}
export type ItemDisplayInfo = Pick<CartItem, 'priceId' | 'name' | 'quantity'>;

export const cartItems = persistentMap<Record<string, CartItem>>('cart:', {}, {
  encode: JSON.stringify,
  decode: JSON.parse,
});


export function addCartItem({ priceId, name, quantity }: ItemDisplayInfo) {
  const existingEntry = cartItems.get()[priceId];
  if (!existingEntry) {
    cartItems.setKey(
      priceId,
      { priceId, name, quantity }
    );
  }
}