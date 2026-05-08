import { useMemo, useState } from "react";
import TypedMenus from "@/context/Menus";
import TypedTable from "@/context/Table";
import { useGetCustomers } from "@/hooks/useCustomers";
import { Input } from "@/components/ui/input";
import CustomerList from "./CustomerList";

const CustomersTable = () => {
  const { data: customers = [], isLoading, isError } = useGetCustomers();

  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredCustomers = useMemo(() => {
    if (!normalizedSearch) return customers;

    return customers.filter((customer) => {
      return [
        customer.fullName,
        customer.phone,
        customer.email,
        customer.address,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch));
    });
  }, [customers, normalizedSearch]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-emerald-900/70 shadow-sm">
        Loading customers...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        Unable to load customers.
      </div>
    );
  }

  return (
    <section className="space-y-4 border border-emerald-100/70 bg-white p-4 shadow-sm sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-semibold text-emerald-950">Customers</h2>
          <p className="text-sm text-emerald-900/60">
            {filteredCustomers.length} shown
            {normalizedSearch ? " (filtered)" : ""}
          </p>
        </div>

        <Input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search customers"
          placeholder="Search by name, phone, email or address"
          className="h-10 w-full sm:max-w-xs"
        />
      </div>

      <TypedMenus>
        <TypedTable columns="1.2fr 1.3fr 1fr auto">
          <TypedTable.Header>
            <div>Name</div>
            <div>Email</div>
            <div>Phone</div>
            <div className="text-right">Actions</div>
          </TypedTable.Header>

          <TypedTable.Body
            data={filteredCustomers}
            resourceName="customers"
            render={(customer) => (
              <CustomerList customer={customer} key={customer.id} />
            )}
          />
        </TypedTable>
      </TypedMenus>
    </section>
  );
};

export default CustomersTable;
