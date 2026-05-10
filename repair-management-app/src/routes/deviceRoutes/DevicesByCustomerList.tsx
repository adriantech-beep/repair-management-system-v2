import TypedTable from "@/context/Table";
import type { DeviceListItem } from "@/types/device";
import { Pencil, Trash2 } from "lucide-react";
import EditDeviceForm from "./EditDeviceForm";
import TypedMenus from "@/context/Menus";
import { useState } from "react";
import { useDeleteDevice } from "@/hooks/useDevices";

type DevicesByCustomerListProps = {
  device: DeviceListItem;
};

const DevicesByCustomerList = ({ device }: DevicesByCustomerListProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const { mutateAsync: deleteDevice, isPending: isDeleting } =
    useDeleteDevice();
  const { brand, model, imeiOrSerialNumber, deviceType } = device;

  const handleDelete = async () => {
    if (isDeleting) return;

    const confirmed = window.confirm(
      "Delete this device? This action cannot be undone.",
    );

    if (!confirmed) return;

    try {
      setDeleteError(null);
      await deleteDevice({
        deviceId: device.id,
        customerId: device.customerId,
      });
    } catch {
      setDeleteError("Unable to delete device. Please try again.");
    }
  };

  if (isEditing) {
    return (
      <TypedTable.Row>
        <div className="col-span-full">
          <EditDeviceForm
            deviceId={device.id}
            onCloseModal={() => setIsEditing(false)}
          />
        </div>
      </TypedTable.Row>
    );
  }

  return (
    <TypedTable.Row>
      <p className="truncate font-medium text-emerald-950">{brand}</p>
      <p className="truncate text-xs text-emerald-900/60">
        {model ?? "No model"}
      </p>
      <p className="truncate text-emerald-900/80">
        {imeiOrSerialNumber ?? "No IMEI / serial number"}
      </p>
      <p className="text-emerald-900/80">{deviceType ?? "No device type"}</p>

      <TypedMenus.Menu>
        <TypedMenus.Toggle id={device.id} />
        <TypedMenus.List id={device.id}>
          <TypedMenus.Button
            icon={<Pencil className="h-4 w-4" />}
            onClick={() => setIsEditing(true)}
          >
            Edit
          </TypedMenus.Button>
          <TypedMenus.Button
            icon={<Trash2 className="h-4 w-4" />}
            onClick={handleDelete}
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </TypedMenus.Button>
        </TypedMenus.List>
      </TypedMenus.Menu>
      {deleteError ? (
        <p className="text-xs text-red-600">{deleteError}</p>
      ) : null}
    </TypedTable.Row>
  );
};

export default DevicesByCustomerList;
