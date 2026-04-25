/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { BottomNav } from "@/components/ui/bottom-nav";

jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    ...props
  }: React.AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
    return (
      <a href={href} {...props}>
        {children}
      </a>
    );
  };
});

jest.mock("next/navigation", () => ({
  usePathname: jest.fn().mockReturnValue("/"),
}));

describe("BottomNav", () => {
  it("renders 5 navigation links", () => {
    render(<BottomNav />);
    expect(screen.getAllByRole("link")).toHaveLength(5);
  });

  it("renders all tab labels", () => {
    render(<BottomNav />);
    expect(screen.getByText("Início")).toBeInTheDocument();
    expect(screen.getByText("Mapa")).toBeInTheDocument();
    expect(screen.getByText("Rotas")).toBeInTheDocument();
    expect(screen.getByText("Carimbos")).toBeInTheDocument();
    expect(screen.getByText("Perfil")).toBeInTheDocument();
  });

  it("marks Início as current page when pathname is /", () => {
    render(<BottomNav />);
    const inicioLink = screen.getByText("Início").closest("a");
    expect(inicioLink).toHaveAttribute("aria-current", "page");
  });

  it("marks Rotas tab as aria-disabled", () => {
    render(<BottomNav />);
    const rotasLink = screen.getByText("Rotas").closest("a");
    expect(rotasLink).toHaveAttribute("aria-disabled", "true");
  });

  it("nav element has descriptive aria-label", () => {
    render(<BottomNav />);
    expect(screen.getByRole("navigation")).toHaveAttribute(
      "aria-label",
      "Navegação principal"
    );
  });
});
