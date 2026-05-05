import { useState } from "react";
import { Input } from "@/components/ui/input";
import { useGetCustomers } from "@/hooks/useCustomers";

const CustomerList = () => {
  const { data: customers = [], isLoading, isError } = useGetCustomers();
  const [searchTerm, setSearchTerm] = useState("");

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredCustomers = customers.filter((customer) => {
    if (!normalizedSearch) return true;

    return [customer.fullName, customer.phone, customer.email, customer.address]
      .filter(Boolean)
      .some((value) => value!.toLowerCase().includes(normalizedSearch));
  });

  if (isLoading) return <div>Loading customers...</div>;
  if (isError) return <div>Unable to load customers.</div>;

  return (
    <div className="space-y-4">
      <Input
        type="search"
        value={searchTerm}
        onChange={(event) => setSearchTerm(event.target.value)}
        placeholder="Search customers by name, phone, email, or address"
        aria-label="Search customers"
      />

      {customers.length === 0 ? <div>No customers found.</div> : null}

      {customers.length > 0 && filteredCustomers.length === 0 ? (
        <div>No customers match your search.</div>
      ) : null}

      {filteredCustomers.length > 0 ? (
        <ul className="space-y-3">
          {filteredCustomers.map((customer) => (
            <li key={customer.id} className="rounded-lg border p-4">
              <div>{customer.fullName}</div>
              <div>{customer.email ?? "No email"}</div>
              <div>{customer.phone ?? "No phone"}</div>
              <div>{customer.address ?? "No address"}</div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default CustomerList;
