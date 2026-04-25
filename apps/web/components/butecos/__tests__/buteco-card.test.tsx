/** @jest-environment jsdom */
import { render, screen } from "@testing-library/react";
import { ButecoCard } from "@/components/butecos/buteco-card";

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

jest.mock("next/image", () => {
  return function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  };
});

const mockButeco = {
  nome: "Bar do Zeca",
  bairro: "Pinheiros",
  cidade: "São Paulo",
  petiscoNome: "Coxinha de frango com requeijão",
  fotoUrl: "https://comidadibuteco.com.br/foto.jpg",
  slug: "bar-do-zeca",
};

describe("ButecoCard", () => {
  it("renders buteco name", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByText("Bar do Zeca")).toBeInTheDocument();
  });

  it("links to the buteco detail page", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByRole("link")).toHaveAttribute("href", "/butecos/bar-do-zeca");
  });

  it("photo variant renders img when fotoUrl is provided", () => {
    render(<ButecoCard buteco={mockButeco} variant="photo" />);
    expect(screen.getByRole("img", { name: "Bar do Zeca" })).toBeInTheDocument();
  });

  it("flat variant renders no img", () => {
    render(<ButecoCard buteco={{ ...mockButeco, fotoUrl: null }} variant="flat" />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("defaults to photo variant when fotoUrl is present", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });

  it("defaults to flat variant when fotoUrl is null", () => {
    render(<ButecoCard buteco={{ ...mockButeco, fotoUrl: null }} />);
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders petiscoNome when provided", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByText("Coxinha de frango com requeijão")).toBeInTheDocument();
  });

  it("renders cidade and bairro", () => {
    render(<ButecoCard buteco={mockButeco} />);
    expect(screen.getByText(/Pinheiros/)).toBeInTheDocument();
    expect(screen.getByText(/São Paulo/)).toBeInTheDocument();
  });
});
