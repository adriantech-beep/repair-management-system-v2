import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCreateUser } from "@/hooks/useUsers";
import { useGetBranches } from "@/hooks/useDashboard";
import { userSchema, type UserFormData } from "./userSchema";
import parseApiError from "@/api/parseApiError";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import { useState } from "react";

const CreateUserForm = () => {
  const { mutateAsync: createUser } = useCreateUser();
  const { data: branches = [], isLoading: loadingBranches } = useGetBranches();
  const [success, setSuccess] = useState<string | null>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      role: "Technician",
      branchId: "",
    },
  });

  const onSubmit = async (data: UserFormData) => {
    try {
      form.clearErrors("root");
      setSuccess(null);

      await createUser(data);

      setSuccess(`Staff account for ${data.fullName} created successfully!`);
      form.reset({
        fullName: "",
        email: "",
        password: "",
        role: "Technician",
        branchId: "",
      });
    } catch (error) {
      const parsed = parseApiError(error);

      if (parsed.fieldErrors) {
        for (const [fieldName, messages] of Object.entries(parsed.fieldErrors)) {
          const normalized = fieldName.toLowerCase();
          const firstMessage = messages[0];
          if (!firstMessage) continue;

          if (normalized === "fullname") {
            form.setError("fullName", { message: firstMessage });
          } else if (normalized === "email") {
            form.setError("email", { message: firstMessage });
          } else if (normalized === "password") {
            form.setError("password", { message: firstMessage });
          } else if (normalized === "role") {
            form.setError("role", { message: firstMessage });
          } else if (normalized === "branchid") {
            form.setError("branchId", { message: firstMessage });
          }
        }
      }

      if (parsed.status === 409) {
        form.setError("email", {
          message: "A user with this email address already exists.",
        });
      }

      form.setError("root", {
        message: parsed.message ?? "Unable to create staff user.",
      });
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-5 shadow-sm sm:p-6">
      <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-50 mb-1">
        Register Staff User
      </h2>
      <p className="text-sm text-slate-500 dark:text-zinc-400 mb-5">
        Add a new Admin or Technician account under your tenant domain.
      </p>

      {success && (
        <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-850 dark:text-emerald-350 text-xs font-semibold animate-in fade-in duration-200">
          {success}
        </div>
      )}

      {form.formState.errors.root?.message && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-350 text-xs font-semibold animate-in fade-in duration-200">
          {form.formState.errors.root.message}
        </div>
      )}

      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          {/* Full Name */}
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  Full Name
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="e.g. John Doe"
                    className="h-10 rounded-lg bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-850"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="e.g. john@company.com"
                    className="h-10 rounded-lg bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-850"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="At least 10 chars, 1 upper, 1 special"
                    className="h-10 rounded-lg bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-850"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Role Selection */}
          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  System Role
                </FormLabel>
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 text-sm font-semibold focus:outline-none focus:border-indigo-500 transition cursor-pointer"
                >
                  <option value="Technician">Technician</option>
                  <option value="Admin">Admin</option>
                </select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Branch Selection */}
          <FormField
            control={form.control}
            name="branchId"
            render={({ field }) => (
              <FormItem className="space-y-1.5">
                <FormLabel className="text-sm font-semibold text-slate-700 dark:text-zinc-300">
                  Assigned Branch
                </FormLabel>
                <select
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  disabled={loadingBranches}
                  className="w-full h-10 px-3 rounded-lg bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-850 text-sm font-semibold focus:outline-none focus:border-indigo-500 transition cursor-pointer disabled:opacity-50"
                >
                  <option value="">Select Branch...</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button
            type="submit"
            disabled={form.formState.isSubmitting}
            className="w-full h-10 mt-2 bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-550 dark:hover:bg-indigo-600 text-white font-semibold rounded-lg shadow-md transition cursor-pointer flex items-center justify-center gap-2"
          >
            {form.formState.isSubmitting ? (
              <Loader2 className="h-4.5 w-4.5 animate-spin" />
            ) : (
              "Create User Account"
            )}
          </Button>
        </form>
      </FormProvider>
    </section>
  );
};

export default CreateUserForm;
