/** @jest-environment jsdom */

import { render } from "@testing-library/react";
import GlobalError from "@/app/global-error";
import * as Sentry from "@sentry/nextjs";

jest.mock("@sentry/nextjs", () => ({
  captureException: jest.fn(),
}));

jest.mock("next/error", () => {
  return function MockNextError({ statusCode }: { statusCode: number }) {
    return <div data-testid="next-error">Error {statusCode}</div>;
  };
});

describe("GlobalError", () => {
  it("captura exceção no Sentry e renderiza fallback de erro", () => {
    const testError = new Error("Test error message");

    render(<GlobalError error={testError} />);

    expect(Sentry.captureException).toHaveBeenCalledWith(testError);
  });
});
