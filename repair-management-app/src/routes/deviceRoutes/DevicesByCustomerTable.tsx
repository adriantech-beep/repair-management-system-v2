import TypedMenus from "@/context/Menus";
import TypedTable from "@/context/Table";
import { useGetDevicesByCustomerId } from "@/hooks/useDevices";
import DevicesByCustomerList from "./DevicesByCustomerList";

const DevicesByCustomerTable = ({ customerId }: { customerId: string }) => {
  const {
    data: devices,
    isLoading,
    isError,
  } = useGetDevicesByCustomerId(customerId);

  console.log(devices);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-emerald-900/70 shadow-sm">
        Loading devices...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        Unable to load devices.
      </div>
    );
  }

  if (devices?.length === 0) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-emerald-900/70 shadow-sm">
        No devices found for this customer.
      </div>
    );
  }
  return (
    <section className="space-y-4 border border-emerald-100/70 bg-white p-4 shadow-sm sm:p-6">
      <TypedMenus>
        <TypedTable columns="1.2fr 1fr 1fr 1fr 120px">
          <TypedTable.Header>
            <div>Brand</div>
            <div>Model</div>
            <div>IMEI / Serial Number</div>
            <div>Device Type</div>
            <div className="text-right">Actions</div>
          </TypedTable.Header>

          <TypedTable.Body
            data={devices || []}
            resourceName="devices"
            render={(device) => (
              <DevicesByCustomerList key={device.id} device={device} />
            )}
          />
        </TypedTable>
      </TypedMenus>
    </section>
  );
};

export default DevicesByCustomerTable;
