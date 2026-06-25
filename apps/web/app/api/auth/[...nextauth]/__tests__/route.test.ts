import { GET, POST } from "@/app/api/auth/[...nextauth]/route";
import { handlers } from "@/lib/auth";

jest.mock("@/lib/auth", () => ({
  handlers: {
    GET: jest.fn(),
    POST: jest.fn(),
  },
}));

describe("NextAuth route", () => {
  it("reexporta handlers GET e POST do NextAuth", () => {
    expect(GET).toBe(handlers.GET);
    expect(POST).toBe(handlers.POST);
  });
});
