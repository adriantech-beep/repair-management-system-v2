import { FormProvider, useForm } from "react-hook-form";
import {
  updateRepairSchema,
  type UpdateRepairFormData,
} from "./updateRepairSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "react-router-dom";
// import useAuthStore from "@/store/authStore";
import { useGetRepairJobById, useUpdateRepairJob } from "@/hooks/useRepairJobs";
import UpdateRepairJobFields from "./UpdateRepairJobFields";
import { Button } from "@/components/ui/button";

const UpdateRepairJobForm = () => {
  const { repairJobId = "" } = useParams();
  // const user = useAuthStore((state) => state.user);
  const {
    data: repairJob,
    isLoading,
    isError,
    error,
  } = useGetRepairJobById(repairJobId);
  const { mutateAsync: updateRepairJob, isPending: isUpdatingRepairJob } =
    useUpdateRepairJob();

  const form = useForm<UpdateRepairFormData>({
    resolver: zodResolver(updateRepairSchema),
    defaultValues: {
      problemDescription: "",
      diagnosisNotes: null,
      resolutionNotes: null,
      estimatedCost: null,
      finalCost: null,
    },
  });

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-emerald-100 bg-white p-6 text-sm text-emerald-900/70 shadow-sm">
        Loading repair job details...
      </div>
    );
  }

  if (isError) {
    const status = (error as { response?: { status?: number } } | null)
      ?.response?.status;
    const message =
      status === 404
        ? "Repair job not found."
        : status === 403
          ? "You do not have access to this repair job."
          : "Unable to load repair job details.";

    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm text-red-700">
        {message}
      </div>
    );
  }

  if (!repairJob) return null;

  const onSubmit = async (data: UpdateRepairFormData) => {
    await updateRepairJob({
      repairJobId,
      payload: data,
    });
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-6">
        <UpdateRepairJobFields />

        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" disabled={isUpdatingRepairJob}>
            {isUpdatingRepairJob ? "Saving..." : "Save Stock"}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};

export default UpdateRepairJobForm;
