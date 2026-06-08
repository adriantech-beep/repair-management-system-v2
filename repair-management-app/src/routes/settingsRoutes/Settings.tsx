import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import useSettingsStore from "@/store/settingsStore";
import useAuthStore from "@/store/authStore";
import {
  useGetTenant,
  useUpdateTenant,
  useUploadTenantLogo,
  useDeleteTenantLogo
} from "@/hooks/useTenants";
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
  ShieldAlert,
  ShieldCheck,
  X,
  FileImage,
  Trash2
} from "lucide-react";
import parseApiError from "@/api/parseApiError";
import { settingsSchema, logoSchema, type SettingsFormData } from "./settingsSchema";

const Settings = () => {
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "Admin";

  const [isDragging, setIsDragging] = useState(false);

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
  const deleteLogoMutation = useDeleteTenantLogo();

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
      processSelectedFile(e.target.files[0]);
    }
  };

  const processSelectedFile = (selectedFile: File) => {
    const validation = logoSchema.safeParse(selectedFile);
    if (!validation.success) {
      setGeneralError(validation.error.issues[0].message);
      return;
    }

    setFile(selectedFile);
    setFilePreview(URL.createObjectURL(selectedFile));
    setGeneralError(null);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdmin) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (!isAdmin) return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
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

  const handleRemoveLogo = () => {
    if (!isAdmin) return;

    // If we have a local staged file, just clear it and revert to the saved tenant logo
    if (file) {
      setFile(null);
      setFilePreview(tenant?.logoUrl ?? null);
      setGeneralError(null);
      return;
    }

    // Otherwise, call API to clear logo from DB
    deleteLogoMutation.mutate(undefined, {
      onSuccess: () => {
        setFilePreview(null);
        setSuccessMessage("Store logo removed successfully!");
        setGeneralError(null);
        setTimeout(() => setSuccessMessage(null), 4000);
      },
      onError: (err) => {
        const parsed = parseApiError(err);
        setGeneralError(parsed.message ?? "Logo removal failed.");
      }
    });
  };

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center animate-pulse">
        <Loader2 className="h-10 w-10 text-indigo-600 dark:text-indigo-400 animate-spin" />
        <span className="ml-3 text-slate-500 dark:text-zinc-400 font-medium">Loading store settings...</span>
      </div>
    );
  }

  if (isError) {
    const parsed = parseApiError(error);
    return (
      <div className="max-w-2xl mx-auto mt-12 p-8 rounded-3xl bg-red-500/10 border border-red-500/20 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-50">Failed to Load Settings</h3>
        <p className="text-slate-500 dark:text-zinc-400 mt-1">{parsed.message ?? "Please verify you are authenticated."}</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-slate-900 dark:text-zinc-100">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 flex items-center gap-2.5">
          <Building className="h-8 w-8 text-indigo-600 dark:text-indigo-400" /> Store Profile & Settings
        </h1>
        <p className="text-slate-500 dark:text-zinc-400 mt-1.5 text-sm">
          Customize your isolated workspace profile, subdomain namespace, and logo branding.
        </p>
      </div>

      {successMessage && (
        <div className="mb-6 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 flex items-center gap-3 text-sm transition-all duration-200">
          <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {generalError && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-800 dark:text-red-400 flex items-center gap-3 text-sm transition-all duration-200">
          <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400 shrink-0" />
          <span>{generalError}</span>
        </div>
      )}

      <RoleGuard allowedRoles={["Technician"]}>
        <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 flex items-center gap-3 text-sm">
          <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>You are viewing settings in Read-Only mode. Only Store Admins can make updates.</span>
        </div>
      </RoleGuard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Side: Logo Branding Section */}
        <div className="md:col-span-1 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 flex flex-col items-center justify-between text-center relative overflow-hidden min-h-[380px]">
          <div className="space-y-5 w-full flex-grow flex flex-col items-center">
            <h3 className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest w-full text-left pl-1">
              Store Logo
            </h3>

            {/* Drag and Drop Container */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`w-full aspect-square max-w-[200px] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center p-4 transition-all duration-300 relative group overflow-hidden ${
                isDragging
                  ? "border-indigo-500 bg-indigo-50/20 dark:bg-indigo-950/20 scale-[1.02]"
                  : "border-slate-200 dark:border-zinc-850 bg-slate-50/50 dark:bg-zinc-950/20 hover:border-indigo-500/40 hover:bg-slate-50 dark:hover:bg-zinc-950/40"
              }`}
            >
              {filePreview ? (
                <div className="w-full h-full flex items-center justify-center relative">
                  <img
                    src={filePreview}
                    alt="Store Logo Preview"
                    className="w-full h-full object-contain p-2 max-h-32 transition-transform duration-300 group-hover:scale-105"
                  />
                  {isAdmin && (
                    <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1.5 transition-opacity duration-300 rounded-xl cursor-pointer">
                      <UploadCloud className="h-6 w-6 text-white animate-bounce" />
                      <span className="text-white text-[10px] font-semibold">Change Image</span>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileChange}
                        disabled={!isAdmin}
                      />
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center space-y-2 text-slate-400 dark:text-zinc-500">
                  <Building className="h-12 w-12 stroke-[1.5]" />
                  <span className="text-xs font-medium">Drag logo here</span>
                </div>
              )}
            </div>

            <p className="text-[11px] text-slate-400 dark:text-zinc-500 leading-relaxed max-w-[180px]">
              JPG, PNG, or WEBP up to 5MB.
            </p>
          </div>

          <RoleGuard allowedRoles={["Admin"]}>
            <div className="mt-6 w-full space-y-3 shrink-0">
              {/* File details when a new local file is staged */}
              {file && (
                <div className="w-full flex items-center justify-between p-2.5 rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 text-xs">
                  <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-300 min-w-0">
                    <FileImage className="h-4 w-4 shrink-0 text-indigo-500" />
                    <span className="truncate font-semibold text-left">{file.name}</span>
                    <span className="text-slate-400 dark:text-zinc-500 text-[10px]">
                      ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="text-slate-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-800 transition cursor-pointer"
                    title="Clear selection"
                  >
                    <X className="h-4.5 w-4.5" />
                  </button>
                </div>
              )}

              {/* Action buttons */}
              {!file ? (
                <label className="flex items-center justify-center w-full h-11 px-4 bg-white hover:bg-slate-50 dark:bg-zinc-950 dark:hover:bg-zinc-900 text-slate-700 dark:text-zinc-300 text-sm font-semibold rounded-xl border border-slate-200 dark:border-zinc-800 cursor-pointer transition shadow-sm">
                  <UploadCloud className="h-4 w-4 mr-2" />
                  Select New Logo
                  <Input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <button
                  type="button"
                  disabled={uploadLogoMutation.isPending}
                  onClick={handleLogoUpload}
                  className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 dark:bg-indigo-500 dark:hover:bg-indigo-600 text-white text-sm font-semibold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 transition cursor-pointer"
                >
                  {uploadLogoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    "Upload New Logo"
                  )}
                </button>
              )}

              {!file && tenant?.logoUrl && (
                <button
                  type="button"
                  disabled={deleteLogoMutation.isPending}
                  onClick={handleRemoveLogo}
                  className="w-full h-11 border border-red-200 hover:bg-red-50/50 dark:border-red-950/20 dark:hover:bg-red-950/10 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
                >
                  {deleteLogoMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4" />
                      Remove Logo
                    </>
                  )}
                </button>
              )}
            </div>
          </RoleGuard>
        </div>

        {/* Right Side: Store Details Profile */}
        <div className="md:col-span-2 bg-white/60 dark:bg-zinc-900/40 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/80 shadow-sm rounded-3xl p-6 md:p-8 space-y-6 flex flex-col justify-between">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSaveName)} className="space-y-6">
              {/* Subdomain Block (Read-only metadata info) */}
              <div className="space-y-2">
                <FormLabel className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                  Subdomain Namespace
                </FormLabel>
                <div className="relative flex items-center">
                  <Globe className="absolute left-4 h-5 w-5 text-slate-400 dark:text-zinc-500 pointer-events-none" />
                  <Input
                    type="text"
                    disabled
                    value={tenant ? `${tenant.subdomain}.atechlabs.it.com` : "loading..."}
                    className="h-12 pl-11 pr-10 rounded-xl bg-slate-50/50 dark:bg-zinc-950/30 border-slate-200 dark:border-zinc-800/80 text-slate-500 dark:text-zinc-400 font-semibold disabled:opacity-100 disabled:cursor-not-allowed w-full shadow-none transition"
                  />
                  <div
                    className="absolute right-4 flex items-center text-slate-400 dark:text-zinc-500"
                    title="Subdomain namespace is fixed and managed under tenant licensing"
                  >
                    <ShieldCheck className="h-5 w-5 text-emerald-500 dark:text-emerald-400" />
                  </div>
                </div>
                <p className="text-xs text-slate-400 dark:text-zinc-500 pl-1 leading-relaxed">
                  Subdomain namespace is fixed during account provisioning and billing setup.
                </p>
              </div>

              {/* Company Name using Shadcn form component inputs */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-xs font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-widest pl-1">
                      Company Name
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="text"
                        disabled={!isAdmin}
                        placeholder="Enter store name"
                        className="h-12 rounded-xl bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-800 text-slate-900 dark:text-zinc-50 placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-500/20 disabled:text-slate-400 disabled:bg-slate-50/50 dark:disabled:bg-zinc-950/50 disabled:cursor-not-allowed transition"
                        {...field}
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    </FormControl>
                    <FormMessage className="text-xs text-destructive" />
                  </FormItem>
                )}
              />

              <RoleGuard allowedRoles={["Admin"]}>
                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    disabled={updateInfoMutation.isPending}
                    className="h-12 px-6 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white font-semibold rounded-xl shadow-md shadow-indigo-500/10 hover:shadow-indigo-500/20 flex items-center justify-center gap-2 transition cursor-pointer"
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
