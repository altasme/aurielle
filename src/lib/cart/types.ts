export type CollectionCartItem = {
  slug: string;
  name: string;
  price: number;
  currency: string;
  quantity: number;
};

export type SupplyCartItem = {
  slug: string;
  serialNumber: number;
  displayName: string;
  price: number;
  currency: string;
  pricingUnit: string;
  quantity: number;
};

export type CartState = {
  collection: CollectionCartItem[];
  supply: SupplyCartItem[];
};

export const EMPTY_CART_STATE: CartState = { collection: [], supply: [] };
