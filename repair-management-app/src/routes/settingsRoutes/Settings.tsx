import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSettingsStore from "@/store/settingsStore";
import useAuthStore from "@/store/authStore";
import { useGetTenant, useUpdateTenant, useUploadTenantLogo } from "@/hooks/useTenants";
import RoleGuard from "@/components/RoleGuard";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Building,
  UploadCloud,
  Loader2,
  CheckCircle,
  AlertCircle,
  Globe,
  ShieldAlert
} from "lucide-react";
import parseApiError from "@/api/parseApiError";
import { settingsSchema, logoSchema, type SettingsFormData } from "./settingsSchema";



const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "Admin";

  // Zustand Store for local UI states & previews
  const {
    file,
    filePreview,
    generalError,
    successMessage,
    setFile,
    setFilePreview,
    setGeneralError,
    setSuccessMessage,
    reset,
  } = useSettingsStore();

  const { data: tenant, isLoading, isError, error } = useGetTenant();
  const updateInfoMutation = useUpdateTenant();
  const uploadLogoMutation = useUploadTenantLogo();

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      companyName: ""
    }
  });

  useEffect(() => {
    if (tenant) {
      form.setValue("companyName", tenant.companyName);
      setFilePreview(tenant.logoUrl);
    }
  }, [tenant, form, setFilePreview]);

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  const onSaveName = (data: SettingsFormData) => {
    if (!isAdmin) return;
    updateInfoMutation.mutate(data.companyName, {
      onSuccess: () => {
        setSuccessMessage("Store name updated successfully!");
        setGeneralError(null);
        setTimeout(() => setSuccessMessage(null), 4000);
      },
      onError: (err) => {
        const parsed = parseApiError(err);
        setGeneralError(parsed.message ?? "Failed to update store settings.");
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const validation = logoSchema.safeParse(selectedFile);
      if (!validation.success) {
        setGeneralError(validation.error.issues[0].message);
        return;
      }

      setFile(selectedFile);
      setFilePreview(URL.createObjectURL(selectedFile));
      setGeneralError(null);
    }
  };

  const handleLogoUpload = () => {
    if (file && isAdmin) {
      uploadLogoMutation.mutate(file, {
        onSuccess: (newUrl) => {
          setFilePreview(newUrl);
          setFile(null);
          setSuccessMessage("Store logo uploaded and saved successfully!");
          setGeneralError(null);
          setTimeout(() => setSuccessMessage(null), 4000);
        },
        onError: (err) => {
          const parsed = parseApiError(err);
          setGeneralError(parsed.message ?? "Logo upload failed.");
        }
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
        <span className="ml-3 text-slate-300">Loading store settings...</span>
      </div>
    );
  }

  if (isError) {
    const parsed = parseApiError(error);
    return (
      <div className="max-w-2xl mx-auto mt-12 p-6 rounded-2xl bg-red-500/10 border border-red-500/20 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-white">Failed to Load Settings</h3>
        <p className="text-slate-400 mt-1">{parsed.message ?? "Please verify you are authenticated."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-slate-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
          <Building className="h-8 w-8 text-blue-500" /> Store Profile & Settings
        </h1>
        <p className="text-slate-400 mt-1 text-sm">
          Customize your isolated workspace profile, subdomain identifier, and logo branding.
        </p>
      </div>
      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 flex items-center gap-3 text-sm">
          <CheckCircle className="h-5 w-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {generalError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-3 text-sm">
          <AlertCircle className="h-5 w-5 text-red-400 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}
      <RoleGuard allowedRoles={["Technician"]}>
        <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 flex items-center gap-3 text-sm">
          <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0" />
          <span>You are viewing settings in Read-Only mode. Only Store Admins can make updates.</span>
        </div>
      </RoleGuard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* Left Side: Logo Branding Section */}
        <div className="md:col-span-1 bg-slate-900/50 border border-slate-800 rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden">
          <div className="space-y-4 w-full">
            <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Store Logo</h3>
            <div className="relative group w-40 h-40 mx-auto rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
              {filePreview ? (
                <img
                  src={filePreview}
                  alt="Store Logo"
                  className="w-full h-full object-contain p-2"
                />
              ) : (
                <Building className="h-16 w-16 text-slate-700" />
              )}
            </div>
            <p className="text-xs text-slate-500">
              Only JPG, PNG, or WEBP files under 5MB.
            </p>
          </div>

          <RoleGuard allowedRoles={["Admin"]}>
            <div className="mt-6 w-full space-y-3">
              <label className="flex flex-col items-center justify-center px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-xl border border-slate-700 cursor-pointer transition">
                <UploadCloud className="h-4 w-4 mr-2 inline" />
                Select New Logo
                <Input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>

              {file && (
                <button
                  type="button"
                  disabled={uploadLogoMutation.isPending}
                  onClick={handleLogoUpload}
                  className="w-full py-2 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition"
                >
                  {uploadLogoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : "Upload Image"}
                </button>
              )}
            </div>
          </RoleGuard>
        </div>

        {/* Right Side: Store Details Profile */}
        <div className="md:col-span-2 bg-slate-900/50 border border-slate-800 rounded-3xl p-8 space-y-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveName)} className="space-y-6">

              {/* Subdomain Block (Read-only metadata info) */}
              <div className="space-y-2">
                <FormLabel className="text-sm font-medium text-slate-300">
                  Subdomain Namespace
                </FormLabel>
                <div className="flex rounded-xl shadow-sm bg-slate-950 border border-slate-800 p-3 items-center">
                  <Globe className="h-5 w-5 text-slate-500 mr-2" />
                  <span className="text-slate-400 font-semibold">{tenant?.subdomain}</span>
                  <span className="text-slate-600">.atechlabs.it.com</span>
                </div>
                <p className="text-xs text-slate-500">
                  Subdomains are fixed on Stripe provisioning and cannot be edited.
                </p>
              </div>

              {/* Company Name using Shadcn form component inputs */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-slate-300">
                      Company Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={!isAdmin}
                        placeholder="Enter store name"
                        className="h-12 rounded-xl bg-slate-950 border-slate-800 text-white placeholder:text-slate-600 focus-visible:border-blue-500 focus-visible:ring-blue-500/20 disabled:text-slate-500 disabled:bg-slate-950/50 disabled:cursor-not-allowed transition"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-red-400" />
                  </FormItem>
                )}
              />

              <RoleGuard allowedRoles={["Admin"]}>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateInfoMutation.isPending}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-blue-500/10 flex items-center gap-2 transition"
                  >
                    {updateInfoMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                    Save Settings
                  </button>
                </div>
              </RoleGuard>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
};

export default Settings;
