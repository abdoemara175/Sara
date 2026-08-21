import { describe, expect, it } from "vitest";

describe("local administrator bootstrap secret", () => {
  it("is available to the server-side authentication bootstrap", () => {
    const initialPassword = process.env.LOCAL_ADMIN_BOOTSTRAP_PASSWORD;

    expect(initialPassword).toBeTruthy();
    expect(initialPassword?.length).toBeGreaterThan(0);
  });
});
