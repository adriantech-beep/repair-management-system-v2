import { FormProvider, useForm, type Resolver } from "react-hook-form";
import {
  updateRepairSchema,
  type UpdateRepairFormData,
} from "./updateRepairSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useUpdateRepairJob } from "@/hooks/useRepairJobs";
import UpdateRepairJobFields from "./UpdateRepairJobFields";
import { Button } from "@/components/ui/button";
import type { RepairJobResponse, UpdateRepairJobRequest } from "@/types/repairJob";
import { useState } from "react";
import parseApiError from "@/api/parseApiError";

interface UpdateRepairJobFormProps {
  repairJob: RepairJobResponse;
}

const UpdateRepairJobForm = ({ repairJob }: UpdateRepairJobFormProps) => {
  const { mutateAsync: updateRepairJob, isPending: isUpdatingRepairJob } =
    useUpdateRepairJob();

  const [updateError, setUpdateError] = useState<string | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const form = useForm<UpdateRepairFormData>({
    resolver: zodResolver(updateRepairSchema) as unknown as Resolver<UpdateRepairFormData>,
    values: {
      problemDescription: repairJob.problemDescription || "",
      diagnosisNotes: repairJob.diagnosisNotes,
      resolutionNotes: repairJob.resolutionNotes,
      estimatedCost: repairJob.estimatedCost,
      finalCost: repairJob.finalCost,
    },
  });

  const onSubmit = async (data: UpdateRepairFormData) => {
    try {
      setUpdateError(null);
      setUpdateMessage(null);

      await updateRepairJob({
        repairJobId: repairJob.id,
        payload: data as unknown as UpdateRepairJobRequest,
      });

      setUpdateMessage("Repair job details updated.");
    } catch (submitError) {
      const parsed = parseApiError(submitError);
      setUpdateError(parsed.message || "Unable to update repair job.");
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <UpdateRepairJobFields />

        {updateError ? (
          <p className="rounded-md border border-red-100 bg-red-50 px-2 py-1.5 text-xs text-red-700">
            {updateError}
          </p>
        ) : null}

        {updateMessage ? (
          <p className="rounded-md border border-emerald-100 bg-emerald-50 px-2 py-1.5 text-xs text-emerald-800">
            {updateMessage}
          </p>
        ) : null}

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={isUpdatingRepairJob}>
            {isUpdatingRepairJob ? "Saving..." : "Save Job Details"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateRepairJobForm;
