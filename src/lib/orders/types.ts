// Shared between the checkout page (client) and the /api/orders route
// (server) — types only, no runtime code, so it's safe to import from
// either side.

export type OrderLineItem = {
  productType: "perfume" | "supply_material";
  slug: string;
  serialNumber: number | null;
  name: string;
  price: number;
  currency: string;
  pricingUnit: string | null;
  quantity: number;
  lineSubtotal: number;
};

export type Address = {
  address: string;
  city: string;
  stateProvince: string;
  postalCode: string;
  country: string;
};

export type OrderPayload = {
  businessLine: "collection" | "atelier_supply";
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerCountry: string;
  billing: Address;
  shippingSameAsBilling: boolean;
  shipping: Address | null;
  paymentMethod: "gcash" | "bank_transfer";
  items: OrderLineItem[];
  currency: string;
  subtotal: number;
  shippingCost: number;
  total: number;
};
