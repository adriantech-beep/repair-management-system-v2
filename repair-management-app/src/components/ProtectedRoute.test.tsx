import { describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { render, screen } from "@testing-library/react";
import ProtectedRoute from "./ProtectedRoute";

const mockUseAuthStore = vi.fn();

vi.mock("@/store/authStore", () => ({
  default: (selector: (state: { accessToken: string | null }) => unknown) =>
    selector(mockUseAuthStore()),
}));

describe("ProtectedRoute", () => {
  it("redirects to login when no access token", () => {
    mockUseAuthStore.mockReturnValue({ accessToken: null });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Login Page")).toBeInTheDocument();
  });

  it("renders children when access token exists", () => {
    mockUseAuthStore.mockReturnValue({ accessToken: "token" });

    render(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<div>Login Page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });
});
