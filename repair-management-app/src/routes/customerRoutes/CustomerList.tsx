import { Pencil } from "lucide-react";
import TypedMenus from "@/context/Menus";
import TypedTable from "@/context/Table";
import type { CustomerListItem } from "@/types/customer";
import ModalWindow from "@/context/ModalWindow";
import EditCustomerForm from "./EditCustomerForm";

type CustomerRowProps = {
  customer: CustomerListItem;
};

const CustomerList = ({ customer }: CustomerRowProps) => {
  const { fullName, email, phone, address } = customer;

  return (
    <TypedTable.Row>
      <div className="min-w-0">
        <p className="truncate font-medium text-emerald-950">{fullName}</p>
        <p className="truncate text-xs text-emerald-900/60">
          {address ?? "No address"}
        </p>
      </div>

      <p className="truncate text-emerald-900/80">{email ?? "No email"}</p>
      <p className="text-emerald-900/80">{phone ?? "No phone"}</p>

      <ModalWindow>
        <TypedMenus.Menu>
          <TypedMenus.Toggle id={customer.id} />
          <TypedMenus.List id={customer.id}>
            <ModalWindow.Open opens={`edit-${customer.id}`}>
              <TypedMenus.Button icon={<Pencil className="h-4 w-4" />}>
                Edit
              </TypedMenus.Button>
            </ModalWindow.Open>
          </TypedMenus.List>
        </TypedMenus.Menu>

        <ModalWindow.Window name={`edit-${customer.id}`}>
          <EditCustomerForm customerId={customer.id} />
        </ModalWindow.Window>
      </ModalWindow>
    </TypedTable.Row>
  );
};

export default CustomerList;
