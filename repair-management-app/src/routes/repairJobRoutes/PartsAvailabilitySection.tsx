import { useCreateWaitlistRequest, useGetParts } from "@/hooks/useInventory";
import usePartWaitlistStore from "@/store/partWaitlistStore";
import type {
  PartResponse,
  PreferredContactMethod,
  WaitlistStatus,
} from "@/types/inventory";
import type { RepairJobResponse } from "@/types/repairJob";
import parseApiError from "@/api/parseApiError";

interface PartsAvailabilitySectionProps {
  repairJob: RepairJobResponse;
  customer?: any;
  device?: any;
}

function normalizeText(value: string | null | undefined) {
  return value?.trim().toLowerCase() ?? "";
}

function isPartCompatibleWithDevice(
  part: PartResponse,
  brand: string,
  model: string,
) {
  if (!part.compatibilities.length) return false;

  const normalizedBrand = normalizeText(brand);
  const normalizedModel = normalizeText(model);

  return part.compatibilities.some(
    (compatibility) =>
      normalizeText(compatibility.brand) === normalizedBrand &&
      normalizeText(compatibility.modelName) === normalizedModel,
  );
}

function waitlistStatusClass(status: WaitlistStatus) {
  if (status === "Resolved") {
    return "bg-emerald-100 text-emerald-800";
  }
  if (status === "Notified") {
    return "bg-sky-100 text-sky-800";
  }
  if (status === "Cancelled") {
    return "bg-zinc-200 text-zinc-700";
  }
  return "bg-amber-100 text-amber-800";
}

const PartsAvailabilitySection = ({
  repairJob,
  customer,
  device,
}: PartsAvailabilitySectionProps) => {
  const { data: parts = [], isLoading: isLoadingParts } = useGetParts();
  const { mutateAsync: createWaitlistRequest, isPending: isCreatingWaitlist } =
    useCreateWaitlistRequest();

  const {
    activeWaitlistPartId,
    waitlistDraft,
    waitlistMessage,
    waitlistError,
    setActiveWaitlistPartId,
    setWaitlistDraft,
    setWaitlistMessage,
    setWaitlistError,
    resetWaitlist,
  } = usePartWaitlistStore();

  const filteredParts =
    device?.brand && device?.model
      ? parts.filter((part) =>
          isPartCompatibleWithDevice(part, device.brand, device.model),
        )
      : parts;

  const inStockParts = filteredParts.filter((part) => part.stockQuantity > 0);
  const outOfStockParts = filteredParts.filter(
    (part) => part.stockQuantity === 0,
  );

  const openWaitlistForm = (partId: string) => {
    setActiveWaitlistPartId(partId);
    setWaitlistMessage(null);
    setWaitlistError(null);
    setWaitlistDraft({
      customerName: customer?.fullName ?? "",
      customerEmail: customer?.email ?? "",
      customerPhone: customer?.phone ?? "",
      preferredContactMethod: customer?.phone ? "Phone" : "Email",
      notes: `Repair job ${repairJob.jobNumber}`,
    });
  };

  const cancelWaitlistForm = () => {
    resetWaitlist();
  };

  const submitWaitlist = async (partId: string) => {
    try {
      setWaitlistMessage(null);
      setWaitlistError(null);

      if (!waitlistDraft.customerName.trim()) {
        setWaitlistError("Customer name is required.");
        return;
      }

      if (
        !waitlistDraft.customerEmail.trim() &&
        !waitlistDraft.customerPhone.trim()
      ) {
        setWaitlistError("At least one contact method is required.");
        return;
      }

      await createWaitlistRequest({
        partId,
        payload: {
          customerName: waitlistDraft.customerName.trim(),
          customerEmail: waitlistDraft.customerEmail.trim() || null,
          customerPhone: waitlistDraft.customerPhone.trim() || null,
          preferredContactMethod: waitlistDraft.preferredContactMethod,
          notes: waitlistDraft.notes.trim() || null,
        },
      });

      setWaitlistMessage("Waitlist request created successfully.");
      setActiveWaitlistPartId(null);
    } catch (submitError) {
      const parsed = parseApiError(submitError);
      setWaitlistError(parsed.message || "Unable to create waitlist request.");
    }
  };

  return (
    <aside className="space-y-4">
      <section className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm space-y-4">
        <div>
          <h2 className="text-lg font-semibold text-emerald-950">
            Parts Availability
          </h2>
          <p className="mt-1 text-sm text-emerald-900/60">
            Compatible inventory for this repair device.
          </p>
        </div>

        {isLoadingParts ? (
          <p className="text-sm text-emerald-900/70">Loading parts...</p>
        ) : filteredParts.length === 0 ? (
          <p className="text-sm text-emerald-900/70">
            No compatible parts found for this device.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="rounded-xl border border-emerald-100 bg-emerald-50/40 p-3 text-sm text-emerald-900/80">
              <span className="font-semibold text-emerald-950">
                In Stock:
              </span>{" "}
              {inStockParts.length} part(s)
              <span className="ml-4 font-semibold text-emerald-950">
                Out of Stock:
              </span>{" "}
              {outOfStockParts.length} part(s)
            </div>

            {filteredParts.map((part) => {
              const isOutOfStock = part.stockQuantity === 0;
              const isWaitlistOpen = activeWaitlistPartId === part.id;

              return (
                <article
                  key={part.id}
                  className="space-y-3 rounded-xl border border-emerald-100 p-3"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <p className="font-medium text-emerald-950">
                        {part.name}
                      </p>
                      <p className="text-xs text-emerald-900/70">
                        {part.partNumber} · {part.category}
                      </p>
                    </div>
                    <span
                      className={`inline-flex self-start rounded-full px-2.5 py-1 text-xs font-semibold ${
                        isOutOfStock
                          ? "bg-red-100 text-red-700"
                          : "bg-emerald-100 text-emerald-800"
                      }`}
                    >
                      {isOutOfStock
                        ? "Out of stock"
                        : `${part.stockQuantity} in stock`}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700"
                      disabled
                    >
                      Reserve Part to Job (I11)
                    </button>
                    <button
                      type="button"
                      className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700"
                      disabled
                    >
                      Record Part Usage (I12)
                    </button>
                    {isOutOfStock ? (
                      <button
                        type="button"
                        onClick={() =>
                          isWaitlistOpen
                            ? cancelWaitlistForm()
                            : openWaitlistForm(part.id)
                        }
                        className="rounded-md border border-amber-300 bg-amber-50 px-3 py-1.5 text-xs font-medium text-amber-800"
                      >
                        {isWaitlistOpen
                          ? "Cancel Waitlist"
                          : "Create Waitlist Request"}
                      </button>
                    ) : null}
                  </div>

                  {isWaitlistOpen ? (
                    <div className="space-y-3 rounded-lg border border-amber-200 bg-amber-50/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-amber-800">
                        Waitlist Request
                      </p>
                      <div className="grid gap-2 sm:grid-cols-2">
                        <label className="text-xs font-medium text-emerald-900/80">
                          Customer Name
                          <input
                            value={waitlistDraft.customerName}
                            onChange={(event) =>
                              setWaitlistDraft({
                                customerName: event.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                          />
                        </label>

                        <label className="text-xs font-medium text-emerald-900/80">
                          Preferred Contact
                          <select
                            value={waitlistDraft.preferredContactMethod}
                            onChange={(event) =>
                              setWaitlistDraft({
                                preferredContactMethod: event.target
                                  .value as PreferredContactMethod,
                              })
                            }
                            className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                          >
                            <option value="Phone">Phone</option>
                            <option value="Email">Email</option>
                          </select>
                        </label>

                        <label className="text-xs font-medium text-emerald-900/80">
                          Customer Phone
                          <input
                            value={waitlistDraft.customerPhone}
                            onChange={(event) =>
                              setWaitlistDraft({
                                customerPhone: event.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                          />
                        </label>

                        <label className="text-xs font-medium text-emerald-900/80">
                          Customer Email
                          <input
                            value={waitlistDraft.customerEmail}
                            onChange={(event) =>
                              setWaitlistDraft({
                                customerEmail: event.target.value,
                              })
                            }
                            className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                          />
                        </label>
                      </div>

                      <label className="block text-xs font-medium text-emerald-900/80">
                        Notes
                        <textarea
                          value={waitlistDraft.notes}
                          onChange={(event) =>
                            setWaitlistDraft({
                              notes: event.target.value,
                            })
                          }
                          rows={2}
                          className="mt-1 w-full rounded-md border border-emerald-200 bg-white px-2 py-1.5 text-sm"
                        />
                      </label>

                      {waitlistError ? (
                        <p className="rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-xs text-red-700">
                          {waitlistError}
                        </p>
                      ) : null}

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => submitWaitlist(part.id)}
                          disabled={isCreatingWaitlist}
                          className="rounded-md bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-60"
                        >
                          {isCreatingWaitlist
                            ? "Submitting..."
                            : "Submit Waitlist"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelWaitlistForm}
                          className="rounded-md border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}

        {waitlistMessage ? (
          <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
            {waitlistMessage}
          </p>
        ) : null}
      </section>

      <section className="rounded-2xl border border-dashed border-sky-200 bg-sky-50/50 p-6">
        <h2 className="text-lg font-semibold text-sky-900">
          Parts Usage Integration Points
        </h2>
        <p className="mt-2 text-sm text-sky-900/75">
          Action hooks for part reservation and consumption are already
          placed in this layout and will be wired to I11/I12 backend
          endpoints once available.
        </p>
        <span
          className={`mt-3 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${waitlistStatusClass("Pending")}`}
        >
          Waitlist path active
        </span>
      </section>

      <section className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/50 p-6">
        <h2 className="text-lg font-semibold text-emerald-950">Timeline</h2>
        <p className="mt-2 text-sm text-emerald-900/70">
          Timeline entries will appear here once the backend exposes the
          timeline endpoint. The detail layout already isolates this panel
          so the future integration stays local.
        </p>
      </section>
    </aside>
  );
};

export default PartsAvailabilitySection;
