/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { Carimbo } from "@/components/ui/carimbo";

describe("Carimbo", () => {
  it("renders the buteco name", () => {
    render(<Carimbo nome="Bar do Zeca" />);
    expect(screen.getByText("Bar do Zeca")).toBeInTheDocument();
  });

  it("shows bairro and numero in lg size", () => {
    render(<Carimbo nome="Bar do Zeca" bairro="Pinheiros" numero="42" size="lg" />);
    expect(screen.getByText("Pinheiros")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("hides bairro and numero in sm size", () => {
    render(<Carimbo nome="Bar do Zeca" bairro="Pinheiros" numero="42" size="sm" />);
    expect(screen.queryByText("Pinheiros")).not.toBeInTheDocument();
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("hides bairro and numero in xs size", () => {
    render(<Carimbo nome="Bar do Zeca" bairro="Pinheiros" numero="42" size="xs" />);
    expect(screen.queryByText("Pinheiros")).not.toBeInTheDocument();
    expect(screen.queryByText("42")).not.toBeInTheDocument();
  });

  it("has aria-label with buteco name", () => {
    render(<Carimbo nome="Bar do Zeca" />);
    expect(screen.getByLabelText("Carimbo: Bar do Zeca")).toBeInTheDocument();
  });
});
