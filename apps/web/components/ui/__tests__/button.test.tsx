/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { Button } from "@/components/ui/button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Confirmar</Button>);
    expect(screen.getByRole("button", { name: "Confirmar" })).toBeInTheDocument();
  });

  it("primary variant includes bg-primary", () => {
    render(<Button variant="primary">Submit</Button>);
    expect(screen.getByRole("button").className).toContain("bg-primary");
  });

  it("secondary variant includes border-tinto-700", () => {
    render(<Button variant="secondary">Cancelar</Button>);
    expect(screen.getByRole("button").className).toContain("border-tinto-700");
  });

  it("ghost variant includes text-ink-soft", () => {
    render(<Button variant="ghost">Sair</Button>);
    expect(screen.getByRole("button").className).toContain("text-ink-soft");
  });

  it("passes through native button props", () => {
    render(<Button disabled>Submit</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("merges className prop", () => {
    render(<Button className="w-full">Submit</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });
});
