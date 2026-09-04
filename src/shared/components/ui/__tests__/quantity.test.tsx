import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Quantity } from "../quantity";

describe("Quantity", () => {
  it("renders the current value", () => {
    render(<Quantity value={3} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Quantity")).toHaveValue(3);
  });

  it("increases and decreases within bounds", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    const { rerender } = render(
      <Quantity value={2} min={1} max={4} onChange={handleChange} />
    );

    await user.click(screen.getByLabelText("Increase quantity"));
    expect(handleChange).toHaveBeenLastCalledWith(3);

    rerender(<Quantity value={3} min={1} max={4} onChange={handleChange} />);
    await user.click(screen.getByLabelText("Decrease quantity"));
    expect(handleChange).toHaveBeenLastCalledWith(2);
  });

  it("disables decrease at min and increase at max", () => {
    const { rerender } = render(
      <Quantity value={1} min={1} max={2} onChange={jest.fn()} />
    );

    expect(screen.getByLabelText("Decrease quantity")).toBeDisabled();
    expect(screen.getByLabelText("Increase quantity")).not.toBeDisabled();

    rerender(<Quantity value={2} min={1} max={2} onChange={jest.fn()} />);
    expect(screen.getByLabelText("Decrease quantity")).not.toBeDisabled();
    expect(screen.getByLabelText("Increase quantity")).toBeDisabled();
  });

  it("clamps typed values to min and max", async () => {
    const user = userEvent.setup();
    const handleChange = jest.fn();

    render(<Quantity value={2} min={1} max={5} onChange={handleChange} />);

    const input = screen.getByLabelText("Quantity");
    await user.clear(input);
    await user.type(input, "9");

    expect(handleChange).toHaveBeenLastCalledWith(5);
  });
});
