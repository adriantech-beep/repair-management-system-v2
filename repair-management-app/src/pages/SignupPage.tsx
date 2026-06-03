import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Link } from "react-router-dom";
import { 
  ShieldCheck, 
  Zap, 
  Layers, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  XCircle, 
  Lock, 
  Mail, 
  Building, 
  Globe, 
  User 
} from "lucide-react";
import apiClient from "@/api/httpClient";
import parseApiError from "@/api/parseApiError";

// 1. Zod Validation Schema matching backend DTO constraints exactly
const signupSchema = z.object({
  fullName: z.string().min(2, "Full Name must be at least 2 characters long"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(10, "Password must be at least 10 characters long")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{10,}$/,
      "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    ),
  companyName: z.string().min(2, "Company Name must be at least 2 characters long"),
  subdomain: z
    .string()
    .min(3, "Subdomain must be at least 3 characters long")
    .regex(/^[a-z0-9\-]+$/, "Subdomain can only contain lowercase letters, numbers, and hyphens.")
});

type SignupFormData = z.infer<typeof signupSchema>;

const SignupPage = () => {
  const [stripeLoading, setStripeLoading] = useState(false);
  const [subdomainStatus, setSubdomainStatus] = useState<{
    state: "idle" | "checking" | "available" | "taken" | "invalid";
    message: string;
  }>({ state: "idle", message: "" });

  const {
    register,
    handleSubmit,
    watch,
    setError,
    clearErrors,
    formState: { errors }
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      companyName: "",
      subdomain: ""
    }
  });

  const watchedSubdomain = watch("subdomain");

  // 2. Debounced Subdomain Uniqueness Checking Effect
  useEffect(() => {

    if (!watchedSubdomain || watchedSubdomain.trim().length < 3) {
      setSubdomainStatus({ state: "idle", message: "" });
      return;
    }

    // Client-side quick syntax validation before calling API
    const isValidSyntax = /^[a-z0-9\-]+$/.test(watchedSubdomain);
    if (!isValidSyntax) {
      setSubdomainStatus({
        state: "invalid",
        message: "Only lowercase letters, numbers, and hyphens allowed."
      });
      return;
    }

    const reservedList = ["api", "www", "default", "localhost"];
    if (reservedList.includes(watchedSubdomain.toLowerCase())) {
      setSubdomainStatus({
        state: "invalid",
        message: "This subdomain is reserved for system administration."
      });
      return;
    }

    setSubdomainStatus({ state: "checking", message: "Verifying availability..." });

    const handler = setTimeout(async () => {
      try {
        const response = await apiClient.get<{ available: boolean; message: string }>(
          `/api/onboarding/check-subdomain`,
          { params: { subdomain: watchedSubdomain } }
        );

        if (response.data.available) {
          setSubdomainStatus({
            state: "available",
            message: `${watchedSubdomain}.atechlabs.it.com is available!`
          });
          clearErrors("subdomain");
        } else {
          setSubdomainStatus({
            state: "taken",
            message: response.data.message || "This subdomain is already taken."
          });
        }
      } catch (err) {
        setSubdomainStatus({
          state: "invalid",
          message: "Unable to reach verification server."
        });
      }
    }, 400); // 400ms debounce to prevent spamming C# server

    return () => clearTimeout(handler);
  }, [watchedSubdomain, clearErrors]);

  // 3. Form Submission - Generates Stripe Checkout Session & Redirects
  const onSubmit = async (data: SignupFormData) => {
    if (subdomainStatus.state !== "available") {
      setError("subdomain", {
        type: "manual",
        message: "Please choose an available subdomain before registering."
      });
      return;
    }

    try {
      setStripeLoading(true);
      clearErrors("root");

      // POST to Onboarding controller to get Stripe Checkout URL
      const response = await apiClient.post<{ checkoutUrl: string }>(
        "/api/onboarding/signup",
        data
      );

      if (response.data.checkoutUrl) {
        // Smooth transition to Stripe's secure payment gate
        window.location.href = response.data.checkoutUrl;
      } else {
        throw new Error("No payment session URL returned from the server.");
      }
    } catch (error) {
      setStripeLoading(false);
      const parsedError = parseApiError(error);
      
      if (parsedError.fieldErrors) {
        for (const [field, messages] of Object.entries(parsedError.fieldErrors)) {
          const firstMessage = messages[0];
          if (firstMessage) {
            setError(field as keyof SignupFormData, { message: firstMessage });
          }
        }
      }

      setError("root", {
        message: parsedError.message ?? "Onboarding setup failed. Please try again."
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-[#070b13] font-body text-slate-100 antialiased overflow-hidden relative">
      {/* Abstract Background Tech Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

      <div className="flex flex-col lg:flex-row w-full max-w-7xl mx-auto px-4 py-8 lg:py-16 justify-between gap-12 relative z-10">
        
        {/* ========================================================
            LEFT COLUMN: Atechlabs Brand & Feature Showcase
           ======================================================== */}
        <div className="flex flex-col justify-center flex-1 space-y-8 max-w-xl">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/25 bg-blue-500/5 text-xs text-blue-400 font-semibold tracking-wider uppercase font-mono animate-pulse">
              🚀 Atechlabs SaaS Gateway
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-extrabold text-white leading-tight font-display tracking-tight">
              ATECH<span className="text-blue-500">LABS</span>
            </h1>
            
            <p className="text-lg text-slate-400">
              Enterprise-grade digital infrastructure for high-volume device repair laboratories and branch service networks.
            </p>
          </div>

          <div className="h-[2px] w-32 bg-gradient-to-r from-blue-500 to-violet-600 rounded-full" />

          {/* Feature Highlights with Glowing Accents */}
          <div className="space-y-5">
            <div className="flex gap-4 items-start group">
              <div className="flex items-center justify-center p-3 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-blue-400 shadow-[0_0_15px_rgba(59,130,246,0.1)] group-hover:scale-105 transition-transform">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">Logical Data Quarantine</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Absolute tenant isolation enforced at compilation level by EF Core. Your assets stay completely quarantined.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="flex items-center justify-center p-3 rounded-2xl border border-violet-500/20 bg-violet-500/5 text-violet-400 shadow-[0_0_15px_rgba(124,58,237,0.1)] group-hover:scale-105 transition-transform">
                <Zap className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">Zero-Click Store Provisioning</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Automatic C# Caching and Database seed scripts configure your complete workspace under your own custom domain in seconds.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="flex items-center justify-center p-3 rounded-2xl border border-cyan-500/20 bg-cyan-500/5 text-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.1)] group-hover:scale-105 transition-transform">
                <Layers className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">Rich Prints & Invoices</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Access ready-to-print A4 Intake sheets, consent conditions, custom part billing tables, and thermal receipt formats instantly.
                </p>
              </div>
            </div>

            <div className="flex gap-4 items-start group">
              <div className="flex items-center justify-center p-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.1)] group-hover:scale-105 transition-transform">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100 font-display">Stripe Sandbox Secure Billing</h3>
                <p className="text-sm text-slate-400 mt-1">
                  Integrated with Stripe Subscription Checkout running fully in Test Mode. Experience the full commercial onboarding experience free.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================================
            RIGHT COLUMN: Frosted Glass Signup Form
           ======================================================== */}
        <div className="flex items-center justify-center flex-1 w-full max-w-xl">
          <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 space-y-6 relative">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white leading-none font-display">
                Create Your Lab Workspace
              </h2>
              <p className="text-sm text-slate-400">
                Setup your secure store tenant and start your 14-day free trial.
              </p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              
              {/* 1. Full Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono">
                  Owner Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Jane Doe"
                    {...register("fullName")}
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                {errors.fullName && (
                  <p className="text-xs text-red-400 font-medium mt-1">{errors.fullName.message}</p>
                )}
              </div>

              {/* 2. Email Address Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono">
                  Business Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="email"
                    placeholder="owner@yourrepairshop.com"
                    {...register("email")}
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-400 font-medium mt-1">{errors.email.message}</p>
                )}
              </div>

              {/* 3. Company Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono">
                  Company / Shop Name
                </label>
                <div className="relative">
                  <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Pines Multi Telecom"
                    {...register("companyName")}
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                {errors.companyName && (
                  <p className="text-xs text-red-400 font-medium mt-1">{errors.companyName.message}</p>
                )}
              </div>

              {/* 4. Subdomain Input with Dynamic Uniqueness Checking */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono">
                  Subdomain Address
                </label>
                <div className="relative">
                  <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="pinesmulti"
                    {...register("subdomain")}
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 pl-11 pr-32 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs font-mono font-bold text-slate-500 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                    .atechlabs.it.com
                  </div>
                </div>

                {/* Subdomain Checking Status States */}
                {subdomainStatus.state === "checking" && (
                  <div className="flex items-center gap-1.5 text-xs text-blue-400 font-medium mt-1 animate-pulse">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    {subdomainStatus.message}
                  </div>
                )}
                {subdomainStatus.state === "available" && (
                  <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold mt-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    {subdomainStatus.message}
                  </div>
                )}
                {subdomainStatus.state === "taken" && (
                  <div className="flex items-center gap-1.5 text-xs text-red-400 font-semibold mt-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {subdomainStatus.message}
                  </div>
                )}
                {subdomainStatus.state === "invalid" && (
                  <div className="flex items-center gap-1.5 text-xs text-amber-400 font-medium mt-1">
                    <XCircle className="h-3.5 w-3.5" />
                    {subdomainStatus.message}
                  </div>
                )}
                {errors.subdomain && !subdomainStatus.message && (
                  <p className="text-xs text-red-400 font-medium mt-1">{errors.subdomain.message}</p>
                )}
              </div>

              {/* 5. Secure Password Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 tracking-wide uppercase font-mono">
                  Primary Admin Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <input
                    type="password"
                    placeholder="••••••••••••"
                    {...register("password")}
                    className="h-11 w-full rounded-xl border border-slate-700 bg-slate-900/60 pl-11 pr-4 text-sm text-white placeholder-slate-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-red-400 font-medium mt-1 leading-normal">{errors.password.message}</p>
                )}
              </div>

              {/* Server Root Validation/Billing Error Display */}
              {errors.root && (
                <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-500/5 text-xs font-medium text-red-400 flex items-start gap-2 animate-shake">
                  <XCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold">Registration Error: </span>
                    {errors.root.message}
                  </div>
                </div>
              )}

              {/* 6. Checkout Submit Button */}
              <button
                type="submit"
                disabled={stripeLoading || subdomainStatus.state !== "available"}
                className={`h-12 w-full rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-all duration-300 shadow-lg ${
                  subdomainStatus.state === "available" && !stripeLoading
                    ? "bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer text-white"
                    : "bg-slate-800 text-slate-500 border border-slate-700 cursor-not-allowed"
                }`}
              >
                {stripeLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    PREPARING STRIPE CHECKOUT...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-4 w-4" />
                    BEGIN 14-DAY FREE TRIAL
                  </>
                )}
              </button>
            </form>

            <div className="h-[1px] w-full bg-slate-800" />

            <div className="text-center text-sm text-slate-400">
              Already have an account?{" "}
              <Link to="/login" className="font-bold text-blue-400 hover:underline">
                Log In
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default SignupPage;
