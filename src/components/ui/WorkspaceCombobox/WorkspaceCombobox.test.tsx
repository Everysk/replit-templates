import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import WorkspaceCombobox from "./index";
import type { Workspace } from "@src/types/workspace";

const makeWs = (name: string, group: string | null = null): Workspace => ({
  name,
  group,
  description: "",
  version: "1",
  created: 0,
  updated: 0,
});

const workspaces: Workspace[] = [
  makeWs("Alpha", "Production"),
  makeWs("Beta", "Staging"),
  makeWs("Gamma", null),
];

it("renders with the default label", () => {
  render(<WorkspaceCombobox workspaces={workspaces} selected="Alpha" onSelect={vi.fn()} />);
  expect(screen.getByLabelText("Workspace")).toBeInTheDocument();
});

it("renders with a custom label", () => {
  render(<WorkspaceCombobox workspaces={workspaces} selected="Alpha" onSelect={vi.fn()} label="Project" />);
  expect(screen.getByLabelText("Project")).toBeInTheDocument();
});

it("shows the selected workspace name with group in the input", () => {
  render(<WorkspaceCombobox workspaces={workspaces} selected="Alpha" onSelect={vi.fn()} />);
  expect(screen.getByRole("combobox")).toHaveValue("Alpha (Production)");
});

it("shows only the workspace name when group is null", () => {
  render(<WorkspaceCombobox workspaces={workspaces} selected="Gamma" onSelect={vi.fn()} />);
  expect(screen.getByRole("combobox")).toHaveValue("Gamma");
});

it("opens dropdown and lists all workspaces on click", async () => {
  const user = userEvent.setup();
  render(<WorkspaceCombobox workspaces={workspaces} selected="Alpha" onSelect={vi.fn()} />);
  await user.click(screen.getByRole("combobox"));
  expect(screen.getAllByRole("option")).toHaveLength(3);
});

it("calls onSelect with the workspace name when an option is chosen", async () => {
  const user = userEvent.setup();
  const onSelect = vi.fn();
  render(<WorkspaceCombobox workspaces={workspaces} selected="Alpha" onSelect={onSelect} />);
  await user.click(screen.getByRole("combobox"));
  await user.click(screen.getByRole("option", { name: /Beta/ }));
  expect(onSelect).toHaveBeenCalledWith("Beta");
});

it("filters options by workspace name", async () => {
  const user = userEvent.setup();
  render(<WorkspaceCombobox workspaces={workspaces} selected="Alpha" onSelect={vi.fn()} />);
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.clear(input);
  await user.type(input, "alph");
  expect(screen.getAllByRole("option")).toHaveLength(1);
  expect(screen.getByRole("option", { name: /Alpha/ })).toBeInTheDocument();
});

it("filters options by group name", async () => {
  const user = userEvent.setup();
  render(<WorkspaceCombobox workspaces={workspaces} selected="Alpha" onSelect={vi.fn()} />);
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.clear(input);
  await user.type(input, "staging");
  expect(screen.getAllByRole("option")).toHaveLength(1);
  expect(screen.getByRole("option", { name: /Beta/ })).toBeInTheDocument();
});

it("shows 'No workspaces found' when nothing matches the filter", async () => {
  const user = userEvent.setup();
  render(<WorkspaceCombobox workspaces={workspaces} selected="Alpha" onSelect={vi.fn()} />);
  const input = screen.getByRole("combobox");
  await user.click(input);
  await user.clear(input);
  await user.type(input, "zzz");
  expect(screen.getByText("No workspaces found")).toBeInTheDocument();
});

it("shows a check icon only for the selected workspace in the dropdown", async () => {
  const user = userEvent.setup();
  render(<WorkspaceCombobox workspaces={workspaces} selected="Beta" onSelect={vi.fn()} />);
  await user.click(screen.getByRole("combobox"));
  const betaOption = screen.getByRole("option", { name: /Beta/ });
  const alphaOption = screen.getByRole("option", { name: /Alpha/ });
  expect(betaOption.querySelector("svg")).toBeInTheDocument();
  expect(alphaOption.querySelector("svg")).not.toBeInTheDocument();
});
