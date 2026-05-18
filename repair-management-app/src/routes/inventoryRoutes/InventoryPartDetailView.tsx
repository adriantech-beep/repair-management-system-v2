import { Button } from "@/components/ui/button";
import type { PartResponse } from "@/types/inventory";

type InventoryPartDetailViewProps = {
  part: PartResponse;
  onCloseModal?: () => void;
};

const InventoryPartDetailView = ({
  part,
  onCloseModal,
}: InventoryPartDetailViewProps) => {
  return (
    <div className="space-y-4 p-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-emerald-950">Part Details</h3>
        <p className="text-sm text-emerald-900/70">{part.name}</p>
      </header>

      <div className="grid gap-3 rounded-lg border border-emerald-100/80 bg-white p-4 sm:grid-cols-2">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/60">
            Part Number
          </p>
          <p className="text-sm text-emerald-950">{part.partNumber}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/60">
            Category
          </p>
          <p className="text-sm text-emerald-950">{part.category}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/60">
            Stock Quantity
          </p>
          <p className="text-sm text-emerald-950">{part.stockQuantity}</p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/60">
            Selling Price
          </p>
          <p className="text-sm text-emerald-950">
            ${part.sellingPrice.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/60">
            Supplier Price
          </p>
          <p className="text-sm text-emerald-950">
            ${part.supplierPrice.toFixed(2)}
          </p>
        </div>

        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-900/60">
            Active
          </p>
          <p className="text-sm text-emerald-950">
            {part.isActive ? "Yes" : "No"}
          </p>
        </div>
      </div>

      <section className="space-y-2 rounded-lg border border-emerald-100/80 bg-white p-4">
        <h4 className="text-sm font-semibold text-emerald-950">
          Compatibility
        </h4>

        {part.compatibilities.length === 0 ? (
          <p className="text-sm text-emerald-900/70">
            No compatibility entries found.
          </p>
        ) : (
          <ul className="space-y-2">
            {part.compatibilities.map((compatibility) => (
              <li
                key={compatibility.id}
                className="rounded-md border border-emerald-100 px-3 py-2 text-sm text-emerald-950"
              >
                {compatibility.brand} - {compatibility.modelName}
              </li>
            ))}
          </ul>
        )}
      </section>

      <div className="flex justify-end pt-2">
        <Button type="button" variant="outline" onClick={onCloseModal}>
          Close
        </Button>
      </div>
    </div>
  );
};

export default InventoryPartDetailView;
