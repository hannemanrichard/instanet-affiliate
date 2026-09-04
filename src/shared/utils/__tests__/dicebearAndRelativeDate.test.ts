import { getDicebearAvatarUrl } from "../dicebear";
import { formatRelativeDate } from "../formatRelativeDate";

describe("getDicebearAvatarUrl", () => {
  it("builds a DiceBear initials URL with the provided seed", () => {
    expect(getDicebearAvatarUrl("Sara Ali")).toBe(
      "https://api.dicebear.com/9.x/initials/svg?seed=Sara+Ali"
    );
  });
});

describe("formatRelativeDate", () => {
  it("returns a dash for empty values", () => {
    expect(formatRelativeDate(null)).toBe("—");
    expect(formatRelativeDate(undefined)).toBe("—");
  });

  it("formats with an English suffix", () => {
    const threeDaysAgo = new Date(
      Date.now() - 3 * 24 * 60 * 60 * 1000
    ).toISOString();
    expect(formatRelativeDate(threeDaysAgo, "en")).toMatch(/ago/);
  });
});
