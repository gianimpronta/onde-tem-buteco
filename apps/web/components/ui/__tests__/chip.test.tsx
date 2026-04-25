/** @jest-environment jsdom */
import { fireEvent, render, screen } from "@testing-library/react";
import { Chip } from "@/components/ui/chip";

describe("Chip", () => {
  it("renders children text", () => {
    render(<Chip>São Paulo</Chip>);
    expect(screen.getByText("São Paulo")).toBeInTheDocument();
  });

  it("renders as a button element", () => {
    render(<Chip>São Paulo</Chip>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("applies active classes when active is true", () => {
    render(<Chip active>São Paulo</Chip>);
    expect(screen.getByRole("button").className).toContain("bg-tinto-700");
  });

  it("does not apply active classes when active is false", () => {
    render(<Chip active={false}>São Paulo</Chip>);
    const btn = screen.getByRole("button");
    expect(btn.className).not.toContain("bg-tinto-700");
    expect(btn.className).toContain("bg-surface-alt");
  });

  it("shows indicator dot when active", () => {
    render(<Chip active>São Paulo</Chip>);
    const dot = screen.getByRole("button").querySelector("[aria-hidden]");
    expect(dot).not.toBeNull();
  });

  it("calls onClick when clicked", () => {
    const onClick = jest.fn();
    render(<Chip onClick={onClick}>São Paulo</Chip>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
