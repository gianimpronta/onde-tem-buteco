/** @jest-environment jsdom */

import { fireEvent, render, screen } from "@testing-library/react";
import { ButecoDetailImage } from "@/components/butecos/buteco-detail-image";

jest.mock("next/image", () => {
  return function MockImage(props: React.ImgHTMLAttributes<HTMLImageElement>) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img {...props} alt={props.alt ?? ""} />;
  };
});

describe("ButecoDetailImage", () => {
  it("renderiza imagem do buteco", () => {
    render(<ButecoDetailImage src="https://example.com/bar.jpg" alt="Bar do Zeca" />);

    expect(screen.getByRole("img", { name: "Bar do Zeca" })).toHaveAttribute(
      "src",
      "https://example.com/bar.jpg"
    );
  });

  it("mostra fallback quando a imagem falha", () => {
    render(<ButecoDetailImage src="https://example.com/bar.jpg" alt="Bar do Zeca" />);

    fireEvent.error(screen.getByRole("img", { name: "Bar do Zeca" }));

    expect(screen.queryByRole("img", { name: "Bar do Zeca" })).not.toBeInTheDocument();
  });
});
