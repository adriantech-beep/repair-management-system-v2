import type { PartResponse } from "@/types/inventory";
import { Button } from "@/components/ui/button";
import TypedTable from "@/context/Table";
import ModalWindow from "@/context/ModalWindow";
import TypedMenus from "@/context/Menus";
import EditPartInventoryForm from "./EditPartInventoryForm";
import UpdateStockPartForm from "./UpdateStockPartForm";
import ManagePartCompatibilityForm from "./ManagePartCompatibilityForm";
import InventoryPartDetailView from "./InventoryPartDetailView";
import ManagePartWaitlistForm from "./ManagePartWaitlistForm";
import RoleGuard from "@/components/RoleGuard";

type InventoryPartsListProps = {
  inventory: PartResponse;
};

const InventoryPartsList = ({ inventory }: InventoryPartsListProps) => {
  return (
    <TypedTable.Row>
      <div className="font-medium text-gray-900">{inventory.name}</div>
      <div className="text-gray-600">{inventory.partNumber}</div>
      <div className="text-gray-700">${inventory.sellingPrice.toFixed(2)}</div>
      <div className="text-gray-700">{inventory.stockQuantity}</div>
      <div className="text-gray-700">${inventory.supplierPrice.toFixed(2)}</div>

      <ModalWindow>
        <div className="flex items-center justify-end gap-2">
          <ModalWindow.Open opens={`detail-${inventory.id}`}>
            <Button type="button" variant="outline" size="sm">
              View
            </Button>
          </ModalWindow.Open>

          <RoleGuard allowedRoles={["Technician"]}>
            <ModalWindow.Open opens={`waitlist-${inventory.id}`}>
              <Button type="button" variant="outline" size="sm">
                Waitlist
              </Button>
            </ModalWindow.Open>
          </RoleGuard>

          <RoleGuard allowedRoles={["Admin"]}>
            <TypedMenus.Menu>
              <TypedMenus.Toggle id={inventory.id} />
              <TypedMenus.List id={inventory.id}>
                <ModalWindow.Open opens={`edit-${inventory.id}`}>
                  <TypedMenus.Button>Edit Part Details</TypedMenus.Button>
                </ModalWindow.Open>
                <ModalWindow.Open opens={`update-stock-${inventory.id}`}>
                  <TypedMenus.Button>Update Stock</TypedMenus.Button>
                </ModalWindow.Open>
                <ModalWindow.Open
                  opens={`manage-compatibility-${inventory.id}`}
                >
                  <TypedMenus.Button>Manage Compatibility</TypedMenus.Button>
                </ModalWindow.Open>
              </TypedMenus.List>
            </TypedMenus.Menu>
          </RoleGuard>
        </div>

        <ModalWindow.Window name={`detail-${inventory.id}`}>
          <InventoryPartDetailView part={inventory} />
        </ModalWindow.Window>

        <ModalWindow.Window name={`waitlist-${inventory.id}`}>
          <ManagePartWaitlistForm part={inventory} />
        </ModalWindow.Window>

        <ModalWindow.Window name={`edit-${inventory.id}`}>
          <EditPartInventoryForm part={inventory} />
        </ModalWindow.Window>
        <ModalWindow.Window name={`update-stock-${inventory.id}`}>
          <UpdateStockPartForm part={inventory} />
        </ModalWindow.Window>
        <ModalWindow.Window name={`manage-compatibility-${inventory.id}`}>
          <ManagePartCompatibilityForm part={inventory} />
        </ModalWindow.Window>
      </ModalWindow>
    </TypedTable.Row>
  );
};

export default InventoryPartsList;
