"use client";

import { useSyncExternalStore } from "react";
import {
  EMPTY_CART_STATE,
  type CartState,
  type CollectionCartItem,
  type SupplyCartItem,
} from "./types";

const STORAGE_KEY = "aurielle:cart:v1";

// Module-level singleton store backed by localStorage, read/written via
// useSyncExternalStore, React's own pattern for syncing to an external
// system that only exists on the client (localStorage isn't available
// during SSR). getServerSnapshot returns a constant empty cart so the
// server-rendered HTML always matches the first client render; the real
// value is picked up on the client without a setState-in-effect render
// cascade.
let cartState: CartState = EMPTY_CART_STATE;
let hydrated = false;
const listeners = new Set<() => void>();

function hydrateFromStorage(): void {
  if (hydrated || typeof window === "undefined") return;
  hydrated = true;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) cartState = JSON.parse(raw);
  } catch {
    // Corrupt or inaccessible storage: keep the empty default.
  }
}

function setCartState(next: CartState): void {
  cartState = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cartState));
  }
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): CartState {
  hydrateFromStorage();
  return cartState;
}

function getServerSnapshot(): CartState {
  return EMPTY_CART_STATE;
}

export function useCart() {
  const state = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    state,
    addCollectionItem(item: Omit<CollectionCartItem, "quantity">, quantity = 1) {
      const existing = cartState.collection.find((i) => i.slug === item.slug);
      const collection = existing
        ? cartState.collection.map((i) =>
            i.slug === item.slug ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [...cartState.collection, { ...item, quantity }];
      setCartState({ ...cartState, collection });
    },
    addSupplyItem(item: Omit<SupplyCartItem, "quantity">, quantity = 1) {
      const existing = cartState.supply.find((i) => i.slug === item.slug);
      const supply = existing
        ? cartState.supply.map((i) =>
            i.slug === item.slug ? { ...i, quantity: i.quantity + quantity } : i,
          )
        : [...cartState.supply, { ...item, quantity }];
      setCartState({ ...cartState, supply });
    },
    updateCollectionQuantity(slug: string, quantity: number) {
      const collection =
        quantity <= 0
          ? cartState.collection.filter((i) => i.slug !== slug)
          : cartState.collection.map((i) => (i.slug === slug ? { ...i, quantity } : i));
      setCartState({ ...cartState, collection });
    },
    updateSupplyQuantity(slug: string, quantity: number) {
      const supply =
        quantity <= 0
          ? cartState.supply.filter((i) => i.slug !== slug)
          : cartState.supply.map((i) => (i.slug === slug ? { ...i, quantity } : i));
      setCartState({ ...cartState, supply });
    },
    removeCollectionItem(slug: string) {
      setCartState({
        ...cartState,
        collection: cartState.collection.filter((i) => i.slug !== slug),
      });
    },
    removeSupplyItem(slug: string) {
      setCartState({
        ...cartState,
        supply: cartState.supply.filter((i) => i.slug !== slug),
      });
    },
    clearCollectionCart() {
      setCartState({ ...cartState, collection: [] });
    },
    clearSupplyCart() {
      setCartState({ ...cartState, supply: [] });
    },
  };
}
