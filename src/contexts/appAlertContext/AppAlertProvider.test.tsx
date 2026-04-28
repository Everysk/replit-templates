import { useContext } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AppAlertProvider } from "./appAlertProvider";
import AppAlertContext from "./index";

const Consumer = () => {
    const ctx = useContext(AppAlertContext)!;
    return (
        <>
            <button onClick={() => ctx.showAlert({ message: "Error occurred", severity: "error" })}>
                show error
            </button>
            <button onClick={() => ctx.showAlert({ message: "Action completed", severity: "success" })}>
                show success
            </button>
            <button onClick={ctx.hideAlert}>hide</button>
        </>
    );
};

const setup = () =>
    render(
        <AppAlertProvider>
            <Consumer />
        </AppAlertProvider>
    );

it("renders children", () => {
    setup();
    expect(screen.getByRole("button", { name: "show error" })).toBeInTheDocument();
});

it("showAlert displays the message in the alert", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "show error" }));
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText("Error occurred")).toBeInTheDocument();
});

it("showAlert replaces the message when called again", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "show error" }));
    await user.click(screen.getByRole("button", { name: "show success" }));
    expect(screen.getByText("Action completed")).toBeInTheDocument();
    expect(screen.queryByText("Error occurred")).not.toBeInTheDocument();
});

it("hideAlert closes the alert", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "show error" }));
    await user.click(screen.getByRole("button", { name: "hide" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
});

it("Alert close button dismisses the alert", async () => {
    const user = userEvent.setup();
    setup();
    await user.click(screen.getByRole("button", { name: "show error" }));
    await user.click(screen.getByRole("button", { name: "Close" }));
    await waitFor(() => expect(screen.queryByRole("alert")).not.toBeInTheDocument());
});
