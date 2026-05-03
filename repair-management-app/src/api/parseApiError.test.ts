import { describe, expect, it } from "vitest";
import parseApiError, { type ApiError } from "./parseApiError";

describe("parseApiError", () => {
  it("returns correct ApiError for AxiosError with response", () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: {
          message: "Validation failed",
          errors: { username: ["Username is required"] },
        },
        status: 400,
      },
    } as unknown as Error;
    const expected: ApiError = {
      message: "Validation failed",
      fieldErrors: { username: ["Username is required"] },
      status: 400,
    };
    expect(parseApiError(mockError)).toEqual(expected);
  });

  it("returns correct ApiError for AxiosError without response", () => {
    const mockError = {
      isAxiosError: true,
      response: undefined,
    } as unknown as Error;
    const expected: ApiError = {
      message: "Cannot reach the server. Check your connection.",
      fieldErrors: null,
      status: null,
    };
    expect(parseApiError(mockError)).toEqual(expected);
  });

  it("returns correct ApiError for non-AxiosError", () => {
    const mockError = new Error("Some error");
    const expected: ApiError = {
      message: "An unknown error occurred",
      fieldErrors: null,
      status: null,
    };
    expect(parseApiError(mockError)).toEqual(expected);
  });

  it("returns 401 status and fallback message", () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: {},
        status: 401,
      },
    } as unknown as Error;

    const expected: ApiError = {
      message: "An unknown error occurred",
      fieldErrors: null,
      status: 401,
    };

    expect(parseApiError(mockError)).toEqual(expected);
  });

  it("returns 403 status and fallback message", () => {
    const mockError = {
      isAxiosError: true,
      response: {
        data: {},
        status: 403,
      },
    } as unknown as Error;

    const expected: ApiError = {
      message: "An unknown error occurred",
      fieldErrors: null,
      status: 403,
    };

    expect(parseApiError(mockError)).toEqual(expected);
  });
});
