import TypedMenus from "@/context/Menus";
import TypedTable from "@/context/Table";
import InventoryPartsList from "./InventoryPartsList";
import { useGetParts } from "@/hooks/useInventory";
import { Button } from "@/components/ui/button";
import ModalWindow from "@/context/ModalWindow";
import CreatePartInventoryForm from "./CreatePartInventoryForm";
import RoleGuard from "@/components/RoleGuard";

const InventoryPartsTable = () => {
  const { data: parts, isLoading, error, isError } = useGetParts();
  const partsData = parts ?? [];

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-emerald-900/70 shadow-sm">
        Loading inventory parts details...
      </div>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } } | null)
      ?.response?.status;
    const message =
      status === 404
        ? "Inventory parts not found."
        : status === 403
          ? "You do not have access to these inventory parts."
          : "Unable to load inventory parts details.";

    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {message}
      </div>
    );
  }

  if (partsData.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-emerald-900/70 shadow-sm">
        No inventory parts found.
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 mt-5 flex items-center justify-end p-2">
        <RoleGuard allowedRoles={["Admin"]}>
          <ModalWindow>
            <ModalWindow.Open opens="create-part">
              <Button>Add Part</Button>
            </ModalWindow.Open>

            <ModalWindow.Window name="create-part">
              <CreatePartInventoryForm />
            </ModalWindow.Window>
          </ModalWindow>
        </RoleGuard>
      </div>

      <TypedMenus>
        <TypedTable columns="1.2fr 1.3fr 1fr 1fr 1fr auto">
          <TypedTable.Header>
            <div>Part Name</div>
            <div>Part Number</div>
            <div>Selling Price</div>
            <div>Stock Quantity</div>
            <div>Supplier Price</div>
            <div className="text-right">Actions</div>
          </TypedTable.Header>

          <TypedTable.Body
            data={partsData}
            render={(part) => (
              <InventoryPartsList inventory={part} key={part.id} />
            )}
          />
        </TypedTable>
      </TypedMenus>
    </>
  );
};

export default InventoryPartsTable;
