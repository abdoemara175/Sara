/** @vitest-environment jsdom */
import React from "react";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import Account from "./Account";

const signInMutation = vi.hoisted(() => vi.fn().mockRejectedValue(new Error("Invalid email or password")));
const changePasswordMutation = vi.hoisted(() => vi.fn().mockRejectedValue(new Error("Current password is incorrect")));
const authState = vi.hoisted(() => ({ user: null as { name?: string; email?: string; role?: string; requiresPasswordChange?: boolean } | null, loading: false, isAuthenticated: false }));

vi.mock("@/_core/hooks/useAuth", () => ({
  useAuth: () => ({ ...authState, logout: vi.fn() }),
}));
vi.mock("@/components/storefront", () => ({ CartDrawer: () => null, StoreFooter: () => null, StoreHeader: () => null }));
vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ auth: { me: { invalidate: vi.fn() } } }),
    localAuth: {
      signIn: { useMutation: () => ({ mutateAsync: signInMutation, isPending: false, error: new Error("Invalid email or password") }) },
      changePassword: { useMutation: () => ({ mutateAsync: changePasswordMutation, isPending: false, error: new Error("Current password is incorrect") }) },
    },
  },
}));
vi.mock("@/const", () => ({ startLogin: vi.fn() }));

afterEach(() => { cleanup(); signInMutation.mockClear(); changePasswordMutation.mockClear(); authState.user = null; authState.loading = false; authState.isAuthenticated = false; });

describe("account local sign-in recovery", () => {
  it("contains a rejected sign-in mutation and keeps the error inside the form", async () => {
    render(<Account />);
    fireEvent.change(screen.getByLabelText("Email"), { target: { value: "customer@example.test" } });
    fireEvent.change(screen.getByLabelText("Password"), { target: { value: "wrong-password" } });
    fireEvent.click(screen.getByRole("button", { name: "Sign in" }));
    await waitFor(() => expect(signInMutation).toHaveBeenCalledWith({ email: "customer@example.test", password: "wrong-password" }));
    expect(screen.getByRole("alert").textContent).toContain("Invalid email or password");
  });

  it("contains a rejected temporary-password change and keeps the recovery message inside the form", async () => {
    authState.user = { name: "Temporary admin", email: "admin@example.test", role: "admin", requiresPasswordChange: true };
    authState.isAuthenticated = true;
    render(<Account />);
    fireEvent.change(screen.getByPlaceholderText("Current password"), { target: { value: "wrong-current" } });
    fireEvent.change(screen.getByPlaceholderText("New password"), { target: { value: "NewPassword456" } });
    fireEvent.click(screen.getByRole("button", { name: "Update password" }));
    await waitFor(() => expect(changePasswordMutation).toHaveBeenCalledWith({ currentPassword: "wrong-current", newPassword: "NewPassword456" }));
    expect(screen.getByRole("alert").textContent).toContain("Current password is incorrect");
  });
});
