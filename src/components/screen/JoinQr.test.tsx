import "@testing-library/jest-dom";
import { render } from "@testing-library/react";
import { JoinQr } from "./JoinQr";

describe("JoinQr", () => {
  it("renders an svg for the hero variant", () => {
    const { container } = render(<JoinQr code="ABC" variant="hero" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });

  it("renders an svg for the chip variant", () => {
    const { container } = render(<JoinQr code="ABC" variant="chip" />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});
