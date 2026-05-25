import { useFormContext } from "react-hook-form";
import type { UpdateRepairFormData } from "./updateRepairSchema";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useGetTechnicians } from "@/hooks/useRepairJobs";


type FieldConfig = {
  name: keyof UpdateRepairFormData;
  placeholder: string;
  type: string;
  parseAsNumber?: boolean;
  rows?: number;
};

const updateRepairJobFields: FieldConfig[] = [
  {
    name: "problemDescription",
    placeholder: "Problem Description",
    type: "text",
    rows: 3,
  },
  {
    name: "diagnosisNotes",
    placeholder: "Diagnosis Notes",
    type: "text",
    rows: 2,
  },
  {
    name: "resolutionNotes",
    placeholder: "Resolution Notes",
    type: "text",
    rows: 2,
  },
  {
    name: "estimatedCost",
    placeholder: "Estimated Cost",
    type: "number",
    parseAsNumber: true,
  },
  {
    name: "finalCost",
    placeholder: "Final Cost",
    type: "number",
    parseAsNumber: true,
  },
];

const UpdateRepairJobFields = () => {
  const { control } = useFormContext<UpdateRepairFormData>();
  const { data: technicians, isPending: isLoadingTechnicians } = useGetTechnicians();

  return (
    <div className="space-y-4">
      {updateRepairJobFields.map(
        ({ name, placeholder, type, parseAsNumber, rows }) => (
          <FormField
            key={name}
            control={control}
            name={name}
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-medium text-emerald-950/80">
                  {placeholder}
                </FormLabel>
                <FormControl>
                  {rows !== undefined ? (
                    <textarea
                      placeholder={placeholder}
                      rows={rows}
                      className="flex min-h-[80px] w-full rounded-lg border border-emerald-900/20 bg-white px-3 py-2 text-sm text-emerald-950 placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200 focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      value={field.value ?? ""}
                    />
                  ) : (
                    <Input
                      type={type}
                      placeholder={placeholder}
                      className="h-10 rounded-lg border-emerald-900/20 bg-white text-sm text-emerald-950 placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        if (parseAsNumber) {
                          field.onChange(
                            e.target.value === ""
                              ? undefined
                              : e.target.valueAsNumber,
                          );
                          return;
                        }

                        field.onChange(e.target.value);
                      }}
                    />
                  )}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        ),
      )}

      <FormField
        control={control}
        name="assignedTechnicianId"
        render={({ field }) => (
          <FormItem className="space-y-1.5">
            <FormLabel className="text-sm font-medium text-emerald-950/80">
              Assigned Technician
            </FormLabel>
            <FormControl>
              <select
                className="h-10 w-full rounded-lg border border-emerald-900/20 bg-white px-3 text-sm text-emerald-950 focus:border-emerald-600 focus:ring-emerald-200 focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...field}
                value={field.value ?? ""}
              >
                <option value="">Unassigned</option>
                {isLoadingTechnicians ? (
                  <option disabled>Loading technicians...</option>
                ) : (
                  technicians?.map((tech) => (
                    <option key={tech.id} value={tech.id}>
                      {tech.fullName}
                    </option>
                  ))
                )}
              </select>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

    </div>
  );
};

export default UpdateRepairJobFields;

