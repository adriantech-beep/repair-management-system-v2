import { MemoryRouter } from "react-router-dom";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import Login from "./Login";

const mockNavigate = vi.fn();
const mockSetAuth = vi.fn();
const mockLogin = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual =
    await vi.importActual<typeof import("react-router-dom")>(
      "react-router-dom",
    );

  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock("@/api/authApi", () => ({
  login: (...args: unknown[]) => mockLogin(...args),
}));

vi.mock("@/store/authStore", () => ({
  default: (selector: (state: { setAuth: typeof mockSetAuth }) => unknown) =>
    selector({ setAuth: mockSetAuth }),
}));

describe("Login", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("shows zod validation message for short password", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Username or Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "short");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText("Password must be at least 10 characters"),
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();
  });

  it("stores auth and navigates on successful login", async () => {
    const user = userEvent.setup();

    mockLogin.mockResolvedValue({
      accessToken: "access-token",
      refreshToken: "refresh-token",
      user: {
        id: "1",
        email: "admin@repairmanagement.local",
        role: "Admin",
        branchId: "b1",
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(
      screen.getByLabelText("Username or Email"),
      "admin@repairmanagement.local",
    );
    await user.type(screen.getByLabelText("Password"), "AdminPassword123!");

    await user.click(screen.getByRole("button", { name: /log in/i }));

    await waitFor(() => {
      expect(mockSetAuth).toHaveBeenCalledWith(
        "access-token",
        "refresh-token",
        expect.objectContaining({ role: "Admin" }),
      );
      expect(mockNavigate).toHaveBeenCalledWith("/dashboard", {
        replace: true,
      });
    });
  });

  it("maps backend validation errors and root message", async () => {
    const user = userEvent.setup();

    mockLogin.mockRejectedValue({
      isAxiosError: true,
      response: {
        data: {
          message: "One or more validation errors occurred.",
          errors: {
            Password: ["The field Password must be at least 10 characters."],
          },
        },
      },
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Username or Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "1234567890");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText(
        "The field Password must be at least 10 characters.",
      ),
    ).toBeInTheDocument();
    expect(
      await screen.findByText("One or more validation errors occurred."),
    ).toBeInTheDocument();
  });

  it("shows offline message and skips API call when navigator is offline", async () => {
    const user = userEvent.setup();
    const originalOnline = navigator.onLine;

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: false,
    });

    render(
      <MemoryRouter>
        <Login />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText("Username or Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "1234567890");
    await user.click(screen.getByRole("button", { name: /log in/i }));

    expect(
      await screen.findByText(
        "No internet connection. Please reconnect and try again.",
      ),
    ).toBeInTheDocument();
    expect(mockLogin).not.toHaveBeenCalled();

    Object.defineProperty(window.navigator, "onLine", {
      configurable: true,
      value: originalOnline,
    });
  });
});
