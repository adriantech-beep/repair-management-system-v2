import React, { useState } from "react";
import {
  useGetRepairJobParts,
  useAllocateRepairJobPart,
  useRemoveRepairJobPart,
} from "@/hooks/useRepairJobParts";
import { useGetParts } from "@/hooks/useInventory";
import type { PartResponse } from "@/types/inventory";
import parseApiError from "@/api/parseApiError";
import {
  Plus,
  Trash2,
  Loader2,
  AlertTriangle,
  Sparkles,
  Package,
  CheckCircle,
} from "lucide-react";
import { formatCurrency } from "./repairJobFormatters";

interface RepairJobPartsPanelProps {
  repairJobId: string;
  deviceBrand?: string | null;
  deviceModel?: string | null;
}

const RepairJobPartsPanel = ({
  repairJobId,
  deviceBrand,
  deviceModel,
}: RepairJobPartsPanelProps) => {
  // Local state for part selection and quantity
  const [selectedPartId, setSelectedPartId] = useState<string>("");
  const [quantity, setQuantity] = useState<number>(1);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [formError, setFormError] = useState<string | null>(null);
  const [formSuccess, setFormSuccess] = useState<string | null>(null);

  // Fetch allocated parts for this specific repair job
  const {
    data: allocatedParts = [],
    isLoading: isLoadingAllocated,
    isError: isErrorAllocated,
  } = useGetRepairJobParts(repairJobId);

  // Fetch all parts in inventory to populate the selector
  const {
    data: allParts = [],
    isLoading: isLoadingInventory,
    isError: isErrorInventory,
  } = useGetParts();

  // Mutations
  const { mutateAsync: allocatePart, isPending: isAllocating } =
    useAllocateRepairJobPart();
  const { mutateAsync: removePart, isPending: isRemoving } =
    useRemoveRepairJobPart();

  // Keep track of which part is currently being deleted to show local spinner
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Helper: check compatibility
  const isCompatible = (part: PartResponse) => {
    if (!deviceBrand || !deviceModel || !part.compatibilities.length) return false;
    const brand = deviceBrand.trim().toLowerCase();
    const model = deviceModel.trim().toLowerCase();
    return part.compatibilities.some(
      (c) =>
        c.brand.trim().toLowerCase() === brand &&
        c.modelName.trim().toLowerCase() === model,
    );
  };

  // Filter & sort inventory parts for the dropdown selector
  const filteredInventoryParts = allParts
    .filter((part) => part.isActive)
    .filter((part) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        part.name.toLowerCase().includes(q) ||
        part.partNumber.toLowerCase().includes(q) ||
        part.category.toLowerCase().includes(q)
      );
    })
    .sort((a, b) => {
      // Sort compatible parts to the top
      const aComp = isCompatible(a);
      const bComp = isCompatible(b);
      if (aComp && !bComp) return -1;
      if (!aComp && bComp) return 1;
      return 0;
    });

  // Find currently selected part to enforce stock validation in real-time
  const selectedPart = allParts.find((p) => p.id === selectedPartId);

  // Calculate allocated parts cost subtotal
  const partsSubtotal = allocatedParts.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const handleAllocate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setFormSuccess(null);

    if (!selectedPartId) {
      setFormError("Please select a part from inventory.");
      return;
    }

    if (quantity < 1) {
      setFormError("Quantity must be at least 1 unit.");
      return;
    }

    if (selectedPart && selectedPart.stockQuantity < quantity) {
      setFormError(
        `Insufficient stock! Only ${selectedPart.stockQuantity} units available.`,
      );
      return;
    }

    try {
      await allocatePart({
        jobId: repairJobId,
        payload: {
          partId: selectedPartId,
          quantity,
        },
      });

      setFormSuccess(
        `Successfully allocated ${quantity}x "${selectedPart?.name}" to the job.`,
      );
      // Reset form fields
      setSelectedPartId("");
      setQuantity(1);
      setSearchQuery("");
    } catch (err) {
      const parsed = parseApiError(err);
      setFormError(parsed.message || "Failed to allocate part.");
    }
  };

  const handleRemove = async (allocatedPartId: string, partName: string) => {
    if (!window.confirm(`Are you sure you want to remove "${partName}" from this job?`)) {
      return;
    }

    setFormError(null);
    setFormSuccess(null);
    setDeletingId(allocatedPartId);

    try {
      await removePart({
        jobId: repairJobId,
        allocatedPartId,
      });
      setFormSuccess(`Removed "${partName}" allocation. Stock levels restored.`);
    } catch (err) {
      const parsed = parseApiError(err);
      setFormError(parsed.message || "Failed to remove part allocation.");
    } finally {
      setDeletingId(null);
    }
  };

  const isLoading = isLoadingAllocated || isLoadingInventory;
  const isError = isErrorAllocated || isErrorInventory;

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div className="flex items-center gap-3">
          <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
          <p className="text-sm font-medium text-emerald-950">
            Loading allocated parts panel...
          </p>
        </div>
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-red-800">
          <AlertTriangle className="h-5 w-5" />
          <h3 className="font-semibold">Error Loading Parts Integration</h3>
        </div>
        <p className="text-sm text-red-700">
          Unable to fetch parts allocation records or inventory details. Please refresh the page.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-6 transition-all duration-300 hover:border-emerald-200">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-zinc-100 pb-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-950 flex items-center gap-2">
            <Package className="h-5 w-5 text-emerald-600" />
            Allocated Parts & Materials
          </h2>
          <p className="mt-1 text-sm text-emerald-900/60">
            Link and consume physical parts from the active inventory database.
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-wider text-emerald-900/50">
            Parts Subtotal
          </p>
          <p className="text-xl font-bold text-emerald-950">
            {formatCurrency(partsSubtotal)}
          </p>
        </div>
      </div>

      {/* Notifications */}
      {formError && (
        <div className="flex items-center gap-2 rounded-xl border border-red-100 bg-red-50/60 p-3 text-xs text-red-800 animate-in fade-in slide-in-from-top-1 duration-250">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>{formError}</span>
        </div>
      )}
      {formSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-800 animate-in fade-in slide-in-from-top-1 duration-250">
          <CheckCircle className="h-4 w-4 shrink-0" />
          <span>{formSuccess}</span>
        </div>
      )}

      {/* Allocation List Table */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-emerald-950">
          Currently Allocated Parts ({allocatedParts.length})
        </h3>
        
        {allocatedParts.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-200 py-8 text-center bg-zinc-50/30">
            <Package className="h-8 w-8 text-zinc-400 mb-2 stroke-[1.5]" />
            <p className="text-sm text-zinc-500 font-medium">No parts linked to this job yet</p>
            <p className="text-xs text-zinc-400 mt-1 max-w-[280px]">
              Use the builder form below to select compatible inventory parts and charge them to this client's invoice.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-100">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/70 border-b border-zinc-100 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                  <th className="p-3">Part Details</th>
                  <th className="p-3 text-right">Quantity</th>
                  <th className="p-3 text-right">Unit Price</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3 text-center w-12">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 text-sm text-zinc-700">
                {allocatedParts.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-zinc-50/30 transition-colors duration-150 group"
                  >
                    <td className="p-3">
                      <p className="font-medium text-emerald-950">{item.partName}</p>
                      <p className="text-xs text-zinc-500 font-mono mt-0.5">{item.partNumber}</p>
                    </td>
                    <td className="p-3 text-right font-medium">{item.quantity}</td>
                    <td className="p-3 text-right text-zinc-500">
                      {formatCurrency(item.unitPrice)}
                    </td>
                    <td className="p-3 text-right font-semibold text-emerald-950">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </td>
                    <td className="p-3 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemove(item.id, item.partName)}
                        disabled={isRemoving && deletingId === item.id}
                        className="rounded-lg p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-all duration-150"
                        title="Remove part"
                      >
                        {isRemoving && deletingId === item.id ? (
                          <Loader2 className="h-4 w-4 animate-spin text-red-600" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Allocation Allocator Form */}
      <form
        onSubmit={handleAllocate}
        className="rounded-xl border border-emerald-100 bg-emerald-50/20 p-4 space-y-4"
      >
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-emerald-950 flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-emerald-600" />
            Add Part to Repair Job
          </h3>
          {deviceBrand && deviceModel && (
            <span className="text-[10px] font-bold bg-emerald-100/70 text-emerald-800 px-2 py-0.5 rounded-full uppercase tracking-wider">
              Filtered for {deviceBrand} {deviceModel}
            </span>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-[1.5fr_1fr_0.6fr]">
          {/* Part Selection Dropdown */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-900/80">
              Select Inventory Part
            </label>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Search part name or SKU..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-1.5 text-xs focus:border-emerald-500 focus:outline-none placeholder:text-zinc-400"
              />
              <select
                aria-label="Select Inventory Part"
                value={selectedPartId}
                onChange={(e) => {
                  setSelectedPartId(e.target.value);
                  setQuantity(1);
                  setFormError(null);
                }}
                className="w-full rounded-lg border border-emerald-100 bg-white px-3 py-1.5 text-xs text-zinc-800 focus:border-emerald-500 focus:outline-none"
              >
                <option value="">-- Choose a part --</option>
                {filteredInventoryParts.map((part) => {
                  const comp = isCompatible(part);
                  const isOutOfStock = part.stockQuantity === 0;

                  return (
                    <option
                      key={part.id}
                      value={part.id}
                      disabled={isOutOfStock}
                      className={comp ? "font-semibold bg-emerald-50/50" : ""}
                    >
                      {comp ? "⭐ " : ""}
                      {part.name} ({part.partNumber}) 
                      {comp ? " [Compatible]" : ""}
                      {` - ${formatCurrency(part.sellingPrice)}`}
                      {isOutOfStock ? " [OUT OF STOCK]" : ` [Stock: ${part.stockQuantity}]`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Quantity Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-emerald-900/80">
              Allocation Quantity
            </label>
            <div className="flex h-[38px] items-center rounded-lg border border-emerald-100 bg-white mt-5">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="h-full px-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-colors rounded-l-lg border-r border-zinc-100"
              >
                -
              </button>
              <input
                type="number"
                min={1}
                max={selectedPart?.stockQuantity || 100}
                value={quantity}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  setQuantity(isNaN(val) ? 1 : Math.max(1, val));
                }}
                className="w-full text-center text-xs font-medium focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button
                type="button"
                onClick={() => {
                  const maxStock = selectedPart?.stockQuantity ?? 100;
                  setQuantity(Math.min(maxStock, quantity + 1));
                }}
                className="h-full px-3 text-sm font-semibold text-zinc-500 hover:bg-zinc-50 hover:text-zinc-800 transition-colors rounded-r-lg border-l border-zinc-100"
              >
                +
              </button>
            </div>
            {selectedPart && (
              <p className="text-[10px] text-zinc-500 mt-1 pl-1">
                Available Stock: <span className="font-semibold text-emerald-700">{selectedPart.stockQuantity}</span>
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col justify-end mt-5 sm:mt-0">
            <button
              type="submit"
              disabled={isAllocating || !selectedPartId}
              className="flex w-full items-center justify-center gap-1.5 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 active:bg-emerald-800 disabled:bg-zinc-200 disabled:text-zinc-400 disabled:shadow-none transition-all duration-150 h-[38px]"
            >
              {isAllocating ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Plus className="h-3.5 w-3.5" />
              )}
              Add Part
            </button>
          </div>
        </div>
      </form>
    </section>
  );
};

export default RepairJobPartsPanel;
