import { render, screen } from "@testing-library/react";
import GlobalLoading from ".";

it("renders nothing when isLoading is false", () => {
  const { container } = render(<GlobalLoading isLoading={false} />);
  expect(container).toBeEmptyDOMElement();
});

it("renders a spinner when isLoading is true", () => {
  render(<GlobalLoading isLoading />);
  expect(screen.getByRole("progressbar", { hidden: true })).toBeInTheDocument();
});

it("displays the message when provided", () => {
  render(<GlobalLoading isLoading message="Loading data..." />);
  expect(screen.getByText("Loading data...")).toBeInTheDocument();
});

it("does not display a message when omitted", () => {
  render(<GlobalLoading isLoading />);
  expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
});

it("renders without backdrop when backdrop is false", () => {
  render(<GlobalLoading isLoading backdrop={false} />);
  expect(screen.getByRole("progressbar")).toBeInTheDocument();
});
