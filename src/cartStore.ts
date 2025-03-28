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
    const newCart = { ...cart };
    delete newCart[itemId];
    cartItems.set(newCart);
  }
}

export function clearCart() {
  // Force hydration by reading the store.
  cartItems.get();
  // Then clear the cart.
  cartItems.set({});
}