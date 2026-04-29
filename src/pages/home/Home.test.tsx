import { render, screen } from "@testing-library/react";
import Home from "./index";

it("renders app title", () => {
    render(<Home />);
    expect(screen.getByTestId("text-app-title")).toHaveTextContent("Everysk App Template");
});

it("renders app subtitle", () => {
    render(<Home />);
    expect(screen.getByTestId("text-app-subtitle")).toHaveTextContent("Prompt the agent to begin building your app");
});
