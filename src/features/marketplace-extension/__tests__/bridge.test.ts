import {
  isMarketplaceExtensionInstalled,
  pingMarketplaceExtension,
} from "../bridge";

describe("marketplace extension bridge", () => {
  beforeEach(() => {
    document.documentElement.removeAttribute("data-bellami-marketplace-ext");
  });

  it("detects installation via data attribute", () => {
    expect(isMarketplaceExtensionInstalled()).toBe(false);
    document.documentElement.dataset.bellamiMarketplaceExt = "1";
    expect(isMarketplaceExtensionInstalled()).toBe(true);
  });

  it("resolves ping when the extension attribute is present", async () => {
    document.documentElement.dataset.bellamiMarketplaceExt = "1";
    await expect(pingMarketplaceExtension(50)).resolves.toBe(true);
  });
});
