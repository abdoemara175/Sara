/** @vitest-environment jsdom */
import React from "react";
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { CartProvider, useCart } from "./CartContext";

const getCart = vi.fn();
const createCart = vi.fn();
const addLines = vi.fn();
const updateLines = vi.fn();
const removeLines = vi.fn();

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({
      commerce: { cart: { get: { fetch: getCart } } },
      client: {
        commerce: {
          cart: {
            create: { mutate: createCart },
            addLines: { mutate: addLines },
            updateLines: { mutate: updateLines },
            removeLines: { mutate: removeLines },
          },
        },
      },
    }),
  },
}));

const cart = {
  id: "cart-journey-1",
  checkoutUrl: "https://store.example.test/checkouts/cart-journey-1?channel=online_store",
  itemCount: 2,
  subtotal: { amount: "1580", currencyCode: "EGP" },
  items: [{
    lineId: "line-1",
    variantId: "variant-1",
    quantity: 2,
    productTitle: "Serene Barrier Serum",
    productHandle: "serene-barrier-serum",
    variantTitle: "Default Title",
    image: null,
    lineTotal: { amount: "1580", currencyCode: "EGP" },
  }],
};

function JourneyProbe() {
  const { addItem, isOpen, itemCount, proceedToCheckout, removeItem, updateQuantity } = useCart();
  return <div>
    <button onClick={() => addItem("variant-1", 2)}>Add serum</button>
    <button onClick={() => updateQuantity("line-1", 1)}>Reduce quantity</button>
    <button onClick={() => removeItem("line-1")}>Remove serum</button>
    <button onClick={proceedToCheckout}>Checkout</button>
    <output>{`${itemCount}:${isOpen ? "open" : "closed"}`}</output>
  </div>;
}

beforeEach(() => {
  window.localStorage.clear();
  getCart.mockReset().mockResolvedValue(cart);
  createCart.mockReset().mockResolvedValue(cart);
  addLines.mockReset();
  updateLines.mockReset().mockResolvedValue({ ...cart, itemCount: 1, subtotal: { amount: "790", currencyCode: "EGP" }, items: [{ ...cart.items[0], quantity: 1, lineTotal: { amount: "790", currencyCode: "EGP" } }] });
  removeLines.mockReset().mockResolvedValue({ ...cart, itemCount: 0, subtotal: { amount: "0", currencyCode: "EGP" }, items: [] });
  vi.stubGlobal("open", vi.fn());
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("cart journey", () => {
  it("creates a persisted cart, opens the bag, and hands the shopper to the checkout URL", async () => {
    const user = userEvent.setup();
    render(<CartProvider><JourneyProbe /></CartProvider>);

    await user.click(screen.getByRole("button", { name: "Add serum" }));
    expect(createCart).toHaveBeenCalledWith({ lines: [{ variantId: "variant-1", quantity: 2 }] });
    await waitFor(() => expect(screen.getByText("2:open")).toBeTruthy());
    expect(window.localStorage.getItem("commerce:cart-id")).toBe("cart-journey-1");

    await user.click(screen.getByRole("button", { name: "Reduce quantity" }));
    expect(updateLines).toHaveBeenCalledWith({ cartId: "cart-journey-1", lines: [{ lineId: "line-1", quantity: 1 }] });
    await waitFor(() => expect(screen.getByText("1:open")).toBeTruthy());

    await act(async () => { await user.click(screen.getByRole("button", { name: "Checkout" })); });
    expect(window.open).toHaveBeenCalledWith(cart.checkoutUrl, "_blank", "noopener,noreferrer");

    await user.click(screen.getByRole("button", { name: "Remove serum" }));
    expect(removeLines).toHaveBeenCalledWith({ cartId: "cart-journey-1", lineIds: ["line-1"] });
    await waitFor(() => expect(screen.getByText("0:open")).toBeTruthy());
  });

  it("does not let a delayed stored-cart response overwrite a newer cart action", async () => {
    const user = userEvent.setup();
    let resolveStaleCart: ((value: typeof cart | null) => void) | undefined;
    window.localStorage.setItem("commerce:cart-id", "stale-cart-id");
    getCart.mockImplementationOnce(() => new Promise(resolve => { resolveStaleCart = resolve; }));
    render(<CartProvider><JourneyProbe /></CartProvider>);

    await waitFor(() => expect(getCart).toHaveBeenCalledWith({ cartId: "stale-cart-id" }));
    await user.click(screen.getByRole("button", { name: "Add serum" }));
    await waitFor(() => expect(screen.getByText("2:open")).toBeTruthy());

    await act(async () => { resolveStaleCart?.({ ...cart, id: "stale-cart-id", itemCount: 1 }); });
    await waitFor(() => expect(screen.getByText("2:open")).toBeTruthy());
  });
});
