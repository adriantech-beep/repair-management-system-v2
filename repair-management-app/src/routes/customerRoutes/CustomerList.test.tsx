import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import CustomersTable from "./CustomersTable";

const mockUseGetCustomers = vi.fn();

vi.mock("@/hooks/useCustomers", () => ({
  useGetCustomers: () => mockUseGetCustomers(),
}));

describe("CustomersTable", () => {
  it("renders loading state when data is loading", () => {
    mockUseGetCustomers.mockReturnValue({
      data: [],
      isLoading: true,
      isError: false,
    });

    render(<CustomersTable />);

    expect(screen.getByText("Loading customers...")).toBeInTheDocument();
  });

  it("renders error state when API fails", () => {
    mockUseGetCustomers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: true,
    });

    render(<CustomersTable />);

    expect(screen.getByText("Unable to load customers.")).toBeInTheDocument();
  });

  it("renders empty state with 0 customers shown", () => {
    mockUseGetCustomers.mockReturnValue({
      data: [],
      isLoading: false,
      isError: false,
    });

    render(<CustomersTable />);

    expect(screen.getByText("0 shown")).toBeInTheDocument();
    expect(
      screen.queryByText(/Unable to load customers/),
    ).not.toBeInTheDocument();
  });

  it("filters customers by search term", async () => {
    const user = userEvent.setup();

    mockUseGetCustomers.mockReturnValue({
      data: [
        {
          id: "1",
          fullName: "John Doe",
          phone: "1234567890",
          email: "john@example.com",
          address: "123 Main St",
        },
        {
          id: "2",
          fullName: "Jane Smith",
          phone: "9876543210",
          email: "jane@example.com",
          address: "456 Oak Ave",
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<CustomersTable />);

    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Search customers"), "jane");

    expect(screen.queryByText("John Doe")).not.toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
    expect(screen.getByText("1 shown (filtered)")).toBeInTheDocument();
  });

  it("displays all customers when no search term is entered", () => {
    mockUseGetCustomers.mockReturnValue({
      data: [
        {
          id: "1",
          fullName: "John Doe",
          phone: "1234567890",
          email: "john@example.com",
          address: "123 Main St",
        },
        {
          id: "2",
          fullName: "Jane Smith",
          phone: "9876543210",
          email: "jane@example.com",
          address: "456 Oak Ave",
        },
      ],
      isLoading: false,
      isError: false,
    });

    render(<CustomersTable />);

    expect(screen.getByText("2 shown")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Jane Smith")).toBeInTheDocument();
  });
});
