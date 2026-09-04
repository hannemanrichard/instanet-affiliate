import { render, screen } from "@testing-library/react";
import { Loader } from "../loader";

describe("Loader", () => {
  it("renders an accessible status indicator", () => {
    render(<Loader />);

    expect(screen.getByRole("status", { name: "Loading" })).toHaveClass(
      "ba-loader"
    );
  });
});
