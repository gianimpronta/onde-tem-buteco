/** @jest-environment jsdom */

import { render, screen } from "@testing-library/react";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import LoginPage from "@/app/(auth)/login/page";

jest.mock("next/navigation", () => ({
  redirect: jest.fn(),
}));

jest.mock("@/lib/auth", () => ({
  auth: jest.fn(),
  signIn: jest.fn(),
}));

describe("LoginPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renderiza headline e botão quando não autenticado", async () => {
    (auth as jest.Mock).mockResolvedValue(null);

    const element = await LoginPage({ searchParams: Promise.resolve({}) });
    render(element);

    expect(screen.getByRole("heading", { name: /Continue o rolê de buteco/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Entrar com Google/i })).toBeInTheDocument();
  });

  it("redireciona para '/' quando usuário já está autenticado", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } });

    await LoginPage({ searchParams: Promise.resolve({}) });

    expect(redirect).toHaveBeenCalledWith("/");
  });

  it("redireciona para callbackUrl quando usuário já está autenticado", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } });

    await LoginPage({
      searchParams: Promise.resolve({ callbackUrl: "/minha-conta" }),
    });

    expect(redirect).toHaveBeenCalledWith("/minha-conta");
  });

  it("não renderiza a tela quando há sessão ativa", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } });

    const element = await LoginPage({ searchParams: Promise.resolve({}) });

    expect(element).toBeNull();
  });

  it("ignora callbackUrl absoluto e redireciona para '/'", async () => {
    (auth as jest.Mock).mockResolvedValue({ user: { id: "u1", email: "a@b.com" } });

    await LoginPage({
      searchParams: Promise.resolve({ callbackUrl: "https://evil.com" }),
    });

    expect(redirect).toHaveBeenCalledWith("/");
  });
});
