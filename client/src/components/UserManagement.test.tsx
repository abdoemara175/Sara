/** @vitest-environment jsdom */
import React from "react";
import { fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { UserManagement } from "./UserManagement";

const createMutateAsync = vi.fn(() => Promise.resolve());
const resetMutateAsync = vi.fn(() => Promise.resolve());
const setRoleMutate = vi.fn();
const setActiveMutate = vi.fn();
const deleteMutate = vi.fn();

const members = [
  { id: 1, name: "Store Admin", email: "admin@example.com", loginMethod: "local", role: "admin", isActive: true, mustChangePassword: false },
  { id: 2, name: "Customer One", email: "customer@example.com", loginMethod: "local", role: "user", isActive: true, mustChangePassword: false },
];

vi.mock("@/lib/trpc", () => ({
  trpc: {
    useUtils: () => ({ userAdmin: { list: { invalidate: vi.fn() } } }),
    userAdmin: {
      list: { useQuery: () => ({ data: members, isLoading: false, error: null }) },
      create: { useMutation: () => ({ mutateAsync: createMutateAsync, isPending: false, error: null }) },
      setRole: { useMutation: () => ({ mutate: setRoleMutate, isPending: false }) },
      setActive: { useMutation: () => ({ mutate: setActiveMutate, isPending: false }) },
      delete: { useMutation: () => ({ mutate: deleteMutate, isPending: false }) },
      resetPassword: { useMutation: () => ({ mutateAsync: resetMutateAsync, isPending: false, error: null }) },
    },
  },
}));

afterEach(() => vi.clearAllMocks());

describe("administrator user-management controls", () => {
  it("sends each create, reset, role, active-status, and delete action to its protected mutation", () => {
    render(<UserManagement currentUserId={1} />);

    fireEvent.change(screen.getByPlaceholderText("Name (optional)"), { target: { value: "New Manager" } });
    fireEvent.change(screen.getByPlaceholderText("Email"), { target: { value: "new.manager@example.com" } });
    fireEvent.change(screen.getByPlaceholderText("Temporary password"), { target: { value: "temporary-password" } });
    fireEvent.change(screen.getAllByRole("combobox")[0]!, { target: { value: "admin" } });
    fireEvent.click(screen.getByRole("button", { name: "Create user" }));
    expect(createMutateAsync).toHaveBeenCalledWith({ email: "new.manager@example.com", name: "New Manager", password: "temporary-password", role: "admin" });

    fireEvent.change(screen.getByLabelText("Choose a user for password reset"), { target: { value: "2" } });
    fireEvent.change(screen.getByPlaceholderText("New temporary password"), { target: { value: "customer-reset" } });
    fireEvent.click(screen.getByRole("button", { name: "Reset password" }));
    expect(resetMutateAsync).toHaveBeenCalledWith({ userId: 2, password: "customer-reset" });

    fireEvent.change(screen.getByLabelText("Role for customer@example.com"), { target: { value: "admin" } });
    expect(setRoleMutate).toHaveBeenCalledWith({ userId: 2, role: "admin" });

    const customerRow = screen.getAllByText("customer@example.com").map(node => node.closest("article")).find(Boolean);
    expect(customerRow).toBeTruthy();
    fireEvent.click(within(customerRow!).getByRole("button", { name: "Disable" }));
    expect(setActiveMutate).toHaveBeenCalledWith({ userId: 2, isActive: false });

    fireEvent.click(within(customerRow!).getByRole("button", { name: "Delete customer@example.com" }));
    expect(deleteMutate).toHaveBeenCalledWith({ userId: 2 });
  });
});
