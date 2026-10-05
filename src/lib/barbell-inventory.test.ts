/**
 * @vitest-environment jsdom
 */
import { describe, expect, it, beforeEach } from "vitest";
import {
  DEFAULT_INCREMENT,
  PLATE_INVENTORY_DEFAULTS_LB,
  PLATE_INVENTORY_DEFAULTS_KG,
  getInventoryKey,
  loadInventory,
  saveInventory,
} from "./barbell-inventory";

describe("barbell-inventory", () => {
  beforeEach(() => {
    if (typeof window !== "undefined") window.localStorage.clear();
  });

  it("has correct LB defaults (55:0,45:5,...)", () => {
    expect(PLATE_INVENTORY_DEFAULTS_LB[55]).toBe(0);
    expect(PLATE_INVENTORY_DEFAULTS_LB[45]).toBe(5);
    expect(PLATE_INVENTORY_DEFAULTS_LB[1.25]).toBe(0);
    expect(PLATE_INVENTORY_DEFAULTS_LB[2.5]).toBe(5);
  });

  it("has correct KG defaults", () => {
    expect(PLATE_INVENTORY_DEFAULTS_KG[25]).toBe(5);
    expect(PLATE_INVENTORY_DEFAULTS_KG[0.5]).toBe(0);
  });

  it("loadInventory returns defaults when empty", () => {
    const inv = loadInventory(undefined, "LB");
    expect(inv.increment).toBe(DEFAULT_INCREMENT);
    expect(inv.barWeight).toBe(45);
    expect(inv.platePairs[45]).toBe(5);
  });

  it("round-trips save/load with guestId", () => {
    const inv = {
      barWeight: 35,
      platePairs: { ...PLATE_INVENTORY_DEFAULTS_LB, 45: 3 },
      increment: 10 as const,
    };
    saveInventory(inv, "test-guest");
    const loaded = loadInventory("test-guest", "LB");
    expect(loaded.barWeight).toBe(35);
    expect(loaded.platePairs[45]).toBe(3);
    expect(loaded.increment).toBe(10);
  });

  it("getInventoryKey namespaces by guest", () => {
    expect(getInventoryKey()).toBe("barbell:inventory:v1");
    expect(getInventoryKey("abc")).toBe("barbell:inventory:v1:abc");
  });
});
