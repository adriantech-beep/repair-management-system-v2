/* eslint-disable @typescript-eslint/no-explicit-any */
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";
import Settings from "./Settings";
import useSettingsStore from "@/store/settingsStore";
import useAuthStore from "@/store/authStore";
import { useGetTenant, useUpdateTenant, useUploadTenantLogo, useDeleteTenantLogo } from "@/hooks/useTenants";

// 1. Mock the Zustand stores
vi.mock("@/store/authStore", () => ({
  default: vi.fn(),
}));

vi.mock("@/store/settingsStore", () => ({
  default: vi.fn(),
}));

// 2. Mock the React Query custom hooks
vi.mock("@/hooks/useTenants", () => ({
  useGetTenant: vi.fn(),
  useUpdateTenant: vi.fn(),
  useUploadTenantLogo: vi.fn(),
  useDeleteTenantLogo: vi.fn(),
}));

describe("Settings Page Component Tests", () => {
  // Helper to mock user authentication details
  const mockAuthState = (user: { role: string } | null) => {
    vi.mocked(useAuthStore).mockImplementation((selector: any) => {
      const state = { user };
      return selector ? selector(state) : state;
    });
  };

  // Helper to mock local UI Zustand states
  const mockSettingsState = (stateOverrides = {}) => {
    const defaultState = {
      companyName: "Default Shop",
      file: null,
      filePreview: null,
      generalError: null,
      successMessage: null,
      setCompanyName: vi.fn(),
      setFile: vi.fn(),
      setFilePreview: vi.fn(),
      setGeneralError: vi.fn(),
      setSuccessMessage: vi.fn(),
      reset: vi.fn(),
    };
    vi.mocked(useSettingsStore).mockImplementation((selector: any) => {
      const state = { ...defaultState, ...stateOverrides };
      return selector ? selector(state) : state;
    });
    return { ...defaultState, ...stateOverrides };
  };

  beforeEach(() => {
    vi.resetAllMocks();

    // Set up standard fake tenant details response for queries
    vi.mocked(useGetTenant).mockReturnValue({
      data: {
        id: "tenant-id",
        companyName: "Atech Labs",
        subdomain: "default",
        logoUrl: null,
        subscriptionStatus: "Active",
        createdAtUtc: "2026-06-06T00:00:00Z",
        contactNumber: "+63 917 123 4567",
        website: "https://atechlabs.com",
        businessNumber: "123-456-789-000",
      },
      isLoading: false,
      isError: false,
      error: null,
    } as any);

    // Mock mutation responses
    vi.mocked(useUpdateTenant).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useUploadTenantLogo).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);

    vi.mocked(useDeleteTenantLogo).mockReturnValue({
      mutate: vi.fn(),
      isPending: false,
    } as any);
  });

  it("renders store settings profile details and allows edits for Admin users", () => {
    mockAuthState({ role: "Admin" });
    mockSettingsState({ companyName: "Atech Labs" });

    render(<Settings />);

    expect(screen.getByText("Store Profile & Settings")).toBeInTheDocument();
    expect(screen.getByDisplayValue("Atech Labs")).toBeInTheDocument();
    expect(screen.getByText("Save Settings")).toBeInTheDocument();
    expect(screen.queryByText("You are viewing settings in Read-Only mode. Only Store Admins can make updates.")).not.toBeInTheDocument();
  });

  it("renders read-only mode and alert warning for Technician users", () => {
    mockAuthState({ role: "Technician" });
    mockSettingsState({ companyName: "Atech Labs" });

    render(<Settings />);

    expect(screen.getByText("You are viewing settings in Read-Only mode. Only Store Admins can make updates.")).toBeInTheDocument();
    expect(screen.queryByText("Save Settings")).not.toBeInTheDocument();
    expect(screen.queryByText("Select New Logo")).not.toBeInTheDocument();
  });
});
