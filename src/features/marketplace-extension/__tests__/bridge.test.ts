import {
  isMarketplaceExtensionInstalled,
  pingMarketplaceExtension,
} from "../bridge";

describe("marketplace extension bridge", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-instanet-helper-ext");
    document.documentElement.removeAttribute("data-instanet-helper-extension");
    document.documentElement.removeAttribute("data-instanet-marketplace-extension");
    document.documentElement.removeAttribute("data-instanet-marketplace-ext");
    document.documentElement.removeAttribute("data-instanet-affiliate-extension");
    document.documentElement.removeAttribute("data-instanet-affiliate-ext");
  });

  it("detects installation via data attribute", () => {
    expect(isMarketplaceExtensionInstalled()).toBe(false);
    document.documentElement.dataset.instanetHelperExtension = "1";
    expect(isMarketplaceExtensionInstalled()).toBe(true);
  });

  it("resolves ping when the extension attribute is present", async () => {
    document.documentElement.dataset.instanetHelperExt = "1";
    await expect(pingMarketplaceExtension(50)).resolves.toBe(true);
  });
});
