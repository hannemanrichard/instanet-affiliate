import { parseTikTokPixelIds } from "./pixelTracking";

describe("parseTikTokPixelIds", () => {
  it("returns empty array for null, undefined, or empty string", () => {
    expect(parseTikTokPixelIds(null)).toEqual([]);
    expect(parseTikTokPixelIds(undefined)).toEqual([]);
    expect(parseTikTokPixelIds("")).toEqual([]);
    expect(parseTikTokPixelIds("   ,  , ")).toEqual([]);
  });

  it("parses single id with trim", () => {
    expect(parseTikTokPixelIds("  ABC123  ")).toEqual(["ABC123"]);
  });

  it("parses comma-separated ids and trims", () => {
    expect(parseTikTokPixelIds("ABC, DEF , GHI")).toEqual(["ABC", "DEF", "GHI"]);
  });

  it("deduplicates ids", () => {
    expect(parseTikTokPixelIds("X, X, Y")).toEqual(["X", "Y"]);
  });
});
