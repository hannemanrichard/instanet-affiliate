import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import React from "react";
import { ProductEditor } from "../ProductEditor";

const pushMock = jest.fn();
const mutateAsyncMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

jest.mock("../../application", () => ({
  useProduct: jest.fn(),
  useProductItems: jest.fn(),
  useUpdateProduct: jest.fn(),
}));

jest.mock("@/shared/components/ui/upload-area", () => ({
  UploadArea: () => <div data-testid="upload-area-mock" />,
}));

jest.mock("@/shared/components/ui/upload-area-multiple", () => ({
  UploadAreaMultiple: () => <div data-testid="upload-area-multiple-mock" />,
}));

const mockedHooks = jest.requireMock("../../application") as {
  useProduct: jest.Mock;
  useProductItems: jest.Mock;
  useUpdateProduct: jest.Mock;
};

describe("ProductEditor", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  mutateAsyncMock.mockReset();
  pushMock.mockReset();
    mockedHooks.useUpdateProduct.mockReturnValue({
      mutateAsync: mutateAsyncMock,
      isPending: false,
    });
  });

  it("renders skeleton while loading", () => {
    mockedHooks.useProduct.mockReturnValue({
      data: null,
      isLoading: true,
    });
    mockedHooks.useProductItems.mockReturnValue({
      data: [],
      isLoading: true,
    });

    render(<ProductEditor productId={1} />);
    expect(
      screen.getByTestId("product-editor-skeleton")
    ).toBeInTheDocument();
  });

  it("submits updated product information", async () => {
    mockedHooks.useProduct.mockReturnValue({
      data: {
        id: 1,
        name: "Original name",
        retail_price: 100,
        retail_price_2: null,
        retail_price_3: null,
        wholesale_price: null,
        retail_commission: null,
        wholesale_commission: null,
        weight: null,
        description: "Product description",
        category: "Category",
      },
      isLoading: false,
    });
    mockedHooks.useProductItems.mockReturnValue({
      data: [],
      isLoading: false,
    });
    mutateAsyncMock.mockResolvedValue({});

    render(<ProductEditor productId={1} />);

    fireEvent.change(screen.getByLabelText(/Product name/i), {
      target: { value: "Updated name" },
    });

    const priceInput = screen.getByLabelText(/Retail price \(1 unit\)/i);
    fireEvent.change(priceInput, { target: { value: "150" } });

    fireEvent.click(screen.getByRole("button", { name: /Save changes/i }));

    await waitFor(() =>
      expect(mutateAsyncMock).toHaveBeenCalledWith({
        productId: 1,
        payload: expect.objectContaining({
          product: expect.objectContaining({
            name: "Updated name",
            retail_price: 150,
          }),
        }),
      })
    );
    expect(pushMock).toHaveBeenCalledWith("/dashboard/products");
  });
});


