import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import useAuthStore from "@/store/authStore";
import RoleGuard from "./RoleGuard";

// Mock the Zustand store
vi.mock("@/store/authStore", () => ({
  default: vi.fn(),
}));

describe("RoleGuard", () => {
  // Helper function to mock the Zustand selector's return value
  const mockAuthState = (user: { role: string } | null) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    vi.mocked(useAuthStore).mockImplementation((selector: any) =>
      selector({ user }),
    );
  };

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("renders children when the user role is in the allowed list", () => {
    mockAuthState({ role: "Admin" });

    render(
      <RoleGuard allowedRoles={["Admin"]}>
        <div>Protected Admin Button</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Protected Admin Button")).toBeInTheDocument();
  });

  it("does not render children and renders fallback when role is not allowed", () => {
    mockAuthState({ role: "Technician" });

    render(
      <RoleGuard allowedRoles={["Admin"]} fallback={<div>Access Denied</div>}>
        <div>Protected Admin Button</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Access Denied")).toBeInTheDocument();
    expect(
      screen.queryByText("Protected Admin Button"),
    ).not.toBeInTheDocument();
  });

  it("renders nothing when role is not allowed and no fallback is provided", () => {
    mockAuthState({ role: "Technician" });

    const { container } = render(
      <RoleGuard allowedRoles={["Admin"]}>
        <div>Protected Admin Button</div>
      </RoleGuard>,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it("renders fallback when no user is logged in (user is null)", () => {
    mockAuthState(null);

    render(
      <RoleGuard
        allowedRoles={["Admin", "Technician"]}
        fallback={<div>Please Log In</div>}
      >
        <div>Protected App Feature</div>
      </RoleGuard>,
    );

    expect(screen.getByText("Please Log In")).toBeInTheDocument();
  });
});
