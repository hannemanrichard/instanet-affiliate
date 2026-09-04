import { describe, it, expect } from "@jest/globals";
import { detectTrafficSource, getChannelFromSource } from "./trafficSource";

describe("trafficSource", () => {
  describe("detectTrafficSource", () => {
    it("should detect TikTok from ttclid parameter", () => {
      const params = new URLSearchParams("ttclid=123456");
      expect(detectTrafficSource(params)).toBe("tiktok");
    });

    it("should detect Facebook from fbclid parameter", () => {
      const params = new URLSearchParams("fbclid=123456");
      expect(detectTrafficSource(params)).toBe("facebook");
    });

    it("should detect TikTok from utm_source parameter", () => {
      const params = new URLSearchParams("utm_source=tiktok");
      expect(detectTrafficSource(params)).toBe("tiktok");
    });

    it("should detect Facebook from utm_source parameter", () => {
      const params = new URLSearchParams("utm_source=facebook");
      expect(detectTrafficSource(params)).toBe("facebook");
    });

    it("should detect Facebook from utm_source with fb", () => {
      const params = new URLSearchParams("utm_source=fb");
      expect(detectTrafficSource(params)).toBe("facebook");
    });

    it("should detect TikTok from custom source parameter", () => {
      const params = new URLSearchParams("source=tiktok");
      expect(detectTrafficSource(params)).toBe("tiktok");
    });

    it("should detect Facebook from custom source parameter", () => {
      const params = new URLSearchParams("source=facebook");
      expect(detectTrafficSource(params)).toBe("facebook");
    });

    it("should return null when no source is detected", () => {
      const params = new URLSearchParams();
      expect(detectTrafficSource(params)).toBeNull();
    });

    it("should prioritize ttclid over utm_source", () => {
      const params = new URLSearchParams("ttclid=123&utm_source=facebook");
      expect(detectTrafficSource(params)).toBe("tiktok");
    });

    it("should prioritize fbclid over utm_source", () => {
      const params = new URLSearchParams("fbclid=123&utm_source=tiktok");
      expect(detectTrafficSource(params)).toBe("facebook");
    });

    it("should handle case-insensitive utm_source", () => {
      const params = new URLSearchParams("utm_source=TIKTOK");
      expect(detectTrafficSource(params)).toBe("tiktok");
    });
  });

  describe("getChannelFromSource", () => {
    it("should return 'facebook' for facebook source", () => {
      expect(getChannelFromSource("facebook")).toBe("facebook");
    });

    it("should return 'tiktok' for tiktok source", () => {
      expect(getChannelFromSource("tiktok")).toBe("tiktok");
    });

    it("should return 'storefront' for null source", () => {
      expect(getChannelFromSource(null)).toBe("storefront");
    });

    it("should return 'storefront' for storefront source", () => {
      expect(getChannelFromSource("storefront")).toBe("storefront");
    });
  });
});

