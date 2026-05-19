import parseApiError from "@/api/parseApiError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  preferredContactMethods,
  type PartResponse,
  type PreferredContactMethod,
  type WaitlistResponse,
  type WaitlistStatus,
  waitlistStatuses,
} from "@/types/inventory";
import {
  useCreateWaitlistRequest,
  useGetWaitlistByPart,
  useUpdateWaitlistStatus,
} from "@/hooks/useInventory";
import { useEffect, useState, type FormEvent } from "react";

type ManagePartWaitlistFormProps = {
  part: PartResponse;
  onCloseModal?: () => void;
};

type WaitlistDraft = {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  preferredContactMethod: PreferredContactMethod;
  notes: string;
};

const emptyDraft: WaitlistDraft = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  preferredContactMethod: "Email",
  notes: "",
};

const waitlistStatusLabels: Record<WaitlistStatus, string> = {
  Pending: "Pending",
  Notified: "Notified",
  Resolved: "Resolved",
  Cancelled: "Cancelled",
};

const waitlistStatusClasses: Record<WaitlistStatus, string> = {
  Pending: "bg-amber-50 text-amber-700 border-amber-200",
  Notified: "bg-blue-50 text-blue-700 border-blue-200",
  Resolved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  Cancelled: "bg-slate-100 text-slate-700 border-slate-200",
};

function formatDateTime(iso: string) {
  const date = new Date(iso);
  return Number.isNaN(date.getTime())
    ? iso
    : date.toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
}

function WaitlistItemCard({
  waitlistRequest,
}: {
  waitlistRequest: WaitlistResponse;
}) {
  const { mutateAsync: updateWaitlist } = useUpdateWaitlistStatus();
  const [statusDraft, setStatusDraft] = useState<WaitlistStatus>(
    waitlistRequest.status,
  );
  const [itemError, setItemError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setStatusDraft(waitlistRequest.status);
  }, [waitlistRequest.id, waitlistRequest.status]);

  const handleUpdateStatus = async () => {
    if (statusDraft === waitlistRequest.status || isSaving) return;

    try {
      setItemError(null);
      setIsSaving(true);

      await updateWaitlist({
        waitlistRequestId: waitlistRequest.id,
        payload: { status: statusDraft },
      });
    } catch (error) {
      const parsed = parseApiError(error);
      setItemError(parsed.message ?? "Unable to update waitlist status.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <li className="space-y-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-emerald-950">
              {waitlistRequest.customerName}
            </p>
            <span
              className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-medium ${waitlistStatusClasses[waitlistRequest.status]}`}
            >
              {waitlistStatusLabels[waitlistRequest.status]}
            </span>
          </div>
          <p className="text-xs text-emerald-900/70">
            Preferred contact: {waitlistRequest.preferredContactMethod}
          </p>
          <p className="text-xs text-emerald-900/70">
            Created {formatDateTime(waitlistRequest.createdAtUtc)}
          </p>
        </div>

        <div className="min-w-55 space-y-2">
          <select
            aria-label={`Update status for ${waitlistRequest.customerName}`}
            className="h-10 w-full rounded-md border border-emerald-200 bg-white px-3 text-sm text-emerald-950"
            value={statusDraft}
            onChange={(event) =>
              setStatusDraft(event.target.value as WaitlistStatus)
            }
            disabled={isSaving}
          >
            {waitlistStatuses.map((status) => (
              <option key={status} value={status}>
                {waitlistStatusLabels[status]}
              </option>
            ))}
          </select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="w-full"
            onClick={handleUpdateStatus}
            disabled={isSaving || statusDraft === waitlistRequest.status}
          >
            {isSaving ? "Saving..." : "Update Status"}
          </Button>
        </div>
      </div>

      <div className="grid gap-2 text-sm text-emerald-950 sm:grid-cols-2">
        <p>
          <span className="font-medium text-emerald-900/70">Email: </span>
          {waitlistRequest.customerEmail ?? "-"}
        </p>
        <p>
          <span className="font-medium text-emerald-900/70">Phone: </span>
          {waitlistRequest.customerPhone ?? "-"}
        </p>
      </div>

      {waitlistRequest.notes ? (
        <p className="rounded-md bg-emerald-50 px-3 py-2 text-sm text-emerald-900/90">
          {waitlistRequest.notes}
        </p>
      ) : null}

      {itemError ? (
        <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
          {itemError}
        </p>
      ) : null}
    </li>
  );
}

const ManagePartWaitlistForm = ({
  part,
  onCloseModal,
}: ManagePartWaitlistFormProps) => {
  const { mutateAsync: createWaitlist } = useCreateWaitlistRequest();
  const [filterStatus, setFilterStatus] = useState<WaitlistStatus | "All">(
    "All",
  );
  const [draft, setDraft] = useState<WaitlistDraft>(emptyDraft);
  const [formError, setFormError] = useState<string | null>(null);
  const [formMessage, setFormMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    data: waitlistItems = [],
    isLoading,
    isFetching,
  } = useGetWaitlistByPart(
    part.id,
    filterStatus === "All" ? undefined : filterStatus,
  );

  const handleCreateWaitlist = async (event: FormEvent) => {
    event.preventDefault();

    const customerName = draft.customerName.trim();
    const customerEmail = draft.customerEmail.trim();
    const customerPhone = draft.customerPhone.trim();
    const notes = draft.notes.trim();

    if (!customerName) {
      setFormError("Customer name is required.");
      return;
    }

    if (!customerEmail && !customerPhone) {
      setFormError("At least one contact method is required.");
      return;
    }

    if (
      draft.preferredContactMethod === "Email" &&
      customerEmail.length === 0
    ) {
      setFormError("Preferred email contact requires an email address.");
      return;
    }

    if (
      draft.preferredContactMethod === "Phone" &&
      customerPhone.length === 0
    ) {
      setFormError("Preferred phone contact requires a phone number.");
      return;
    }

    try {
      setFormError(null);
      setFormMessage(null);
      setIsSubmitting(true);

      await createWaitlist({
        partId: part.id,
        payload: {
          customerName,
          customerEmail: customerEmail || null,
          customerPhone: customerPhone || null,
          preferredContactMethod: draft.preferredContactMethod,
          notes: notes || null,
        },
      });

      setDraft(emptyDraft);
      setFilterStatus("Pending");
      setFormMessage("Waitlist request created successfully.");
    } catch (error) {
      const parsed = parseApiError(error);

      if (parsed.fieldErrors) {
        const fieldMessages = Object.entries(parsed.fieldErrors)
          .map(([fieldName, messages]) => `${fieldName}: ${messages[0]}`)
          .filter(Boolean);

        if (fieldMessages.length > 0) {
          setFormError(fieldMessages.join(" | "));
          return;
        }
      }

      setFormError(parsed.message ?? "Unable to create waitlist request.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5 p-6">
      <header className="space-y-1">
        <h3 className="text-lg font-semibold text-emerald-950">
          Manage Waitlist
        </h3>
        <p className="text-sm text-emerald-900/70">
          {part.name} ({part.partNumber})
        </p>
      </header>

      <section className="space-y-3 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="text-sm font-semibold text-emerald-950">
            Current Requests
          </h4>

          <label className="flex items-center gap-2 text-sm text-emerald-950/80">
            <span>Status</span>
            <select
              aria-label="Filter waitlist by status"
              className="h-9 rounded-md border border-emerald-200 bg-white px-3 text-sm"
              value={filterStatus}
              onChange={(event) =>
                setFilterStatus(event.target.value as WaitlistStatus | "All")
              }
            >
              <option value="All">All</option>
              {waitlistStatuses.map((status) => (
                <option key={status} value={status}>
                  {waitlistStatusLabels[status]}
                </option>
              ))}
            </select>
          </label>
        </div>

        {isLoading ? (
          <p className="text-sm text-emerald-900/70">Loading waitlist...</p>
        ) : waitlistItems.length === 0 ? (
          <p className="text-sm text-emerald-900/70">
            No waitlist requests found for this filter.
          </p>
        ) : (
          <ul className="space-y-3">
            {waitlistItems.map((waitlistRequest) => (
              <WaitlistItemCard
                key={waitlistRequest.id}
                waitlistRequest={waitlistRequest}
              />
            ))}
          </ul>
        )}

        {isFetching && !isLoading ? (
          <p className="text-xs text-emerald-900/60">Refreshing...</p>
        ) : null}
      </section>

      <section className="space-y-4 rounded-xl border border-emerald-100 bg-white p-4 shadow-sm">
        <div className="space-y-1">
          <h4 className="text-sm font-semibold text-emerald-950">
            Create Request
          </h4>
          <p className="text-sm text-emerald-900/70">
            Add a customer to the waitlist while the part is unavailable.
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleCreateWaitlist}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-emerald-950/80">
                Customer Name
              </span>
              <Input
                type="text"
                value={draft.customerName}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    customerName: event.target.value,
                  }))
                }
                placeholder="Juan Dela Cruz"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-emerald-950/80">
                Preferred Contact Method
              </span>
              <select
                className="h-10 w-full rounded-md border border-emerald-200 bg-white px-3 text-sm text-emerald-950"
                value={draft.preferredContactMethod}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    preferredContactMethod: event.target
                      .value as PreferredContactMethod,
                  }))
                }
              >
                {preferredContactMethods.map((method) => (
                  <option key={method} value={method}>
                    {method}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="space-y-1.5">
              <span className="text-sm font-medium text-emerald-950/80">
                Email
              </span>
              <Input
                type="email"
                value={draft.customerEmail}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    customerEmail: event.target.value,
                  }))
                }
                placeholder="customer@email.com"
              />
            </label>

            <label className="space-y-1.5">
              <span className="text-sm font-medium text-emerald-950/80">
                Phone
              </span>
              <Input
                type="text"
                value={draft.customerPhone}
                onChange={(event) =>
                  setDraft((prev) => ({
                    ...prev,
                    customerPhone: event.target.value,
                  }))
                }
                placeholder="09171234567"
              />
            </label>
          </div>

          <label className="space-y-1.5 block">
            <span className="text-sm font-medium text-emerald-950/80">
              Notes
            </span>
            <textarea
              className="min-h-24 w-full rounded-md border border-emerald-200 bg-white px-3 py-2 text-sm text-emerald-950 outline-none focus:border-emerald-600"
              value={draft.notes}
              onChange={(event) =>
                setDraft((prev) => ({ ...prev, notes: event.target.value }))
              }
              placeholder="Optional notes about the request"
            />
          </label>

          {formError ? (
            <p className="rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
              {formError}
            </p>
          ) : null}

          {formMessage ? (
            <p className="rounded-md border border-emerald-100 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
              {formMessage}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Waitlist Request"}
            </Button>
            <Button type="button" variant="outline" onClick={onCloseModal}>
              Close
            </Button>
          </div>
        </form>
      </section>
    </div>
  );
};

export default ManagePartWaitlistForm;
