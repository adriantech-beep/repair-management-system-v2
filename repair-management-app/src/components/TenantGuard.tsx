import React from "react";
import { useGetPublicTenant } from "@/hooks/useTenants";
import { AxiosError } from "axios";
import {
  Loader2,
  AlertTriangle,
  CreditCard,
  Wrench,
  Lock,
  Globe
} from "lucide-react";

interface TenantGuardProps {
  children: React.ReactNode;
}

const getSubdomain = () => {
  if (typeof window === "undefined") return null;
  const host = window.location.hostname;
  const hostParts = host.split(".");

  if (hostParts.length > 2 && hostParts[0] !== "www" && hostParts[0] !== "api") {
    // If it is our root domain (e.g. atechlabs.it.com), it has 3 parts.
    // If it is a subdomain (e.g. tenant.atechlabs.it.com), it has 4 parts.
    if (host.toLowerCase().endsWith("atechlabs.it.com") && hostParts.length <= 3) {
      return null;
    }
    return hostParts[0].toLowerCase();
  }

  if (hostParts.length === 2 && hostParts[1].toLowerCase() === "localhost") {
    return hostParts[0].toLowerCase();
  }

  return null;
};

const TenantGuard: React.FC<TenantGuardProps> = ({ children }) => {
  //can either be string or null
  const subdomain = getSubdomain();
  const { isLoading, isError, error } = useGetPublicTenant(!!subdomain);

  // Bypass verification if no subdomain is present (landing page, signup page, etc.)
  if (!subdomain) {
    return <>{children}</>;
  }

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 overflow-hidden px-4">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/15 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 dark:bg-blue-950/15 blur-[120px] pointer-events-none" />
        </div>

        <div className="absolute inset-0 z-0 bg-grid-pattern opacity-60 dark:opacity-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center space-y-4">
          <div className="p-3 bg-white/80 dark:bg-zinc-900/80 rounded-2xl shadow-xl shadow-slate-100/50 dark:shadow-black/20 border border-slate-200/50 dark:border-zinc-800/50">
            <Loader2 className="h-8 w-8 text-indigo-600 dark:text-indigo-400 animate-spin" />
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 animate-pulse">
            Verifying secure workspace...
          </p>
        </div>
      </div>
    );
  }

  if (isError && error) {
    const axiosError = error as AxiosError<{ code?: string; message?: string }>;
    const status = axiosError.response?.status;
    const errorCode = axiosError.response?.data?.code;

    const ErrorLayout = ({
      icon: Icon,
      title,
      description,
      actionLabel,
      actionHref,
      badgeText,
      badgeColor
    }: {
      icon: any;
      title: string;
      description: string;
      actionLabel?: string;
      actionHref?: string;
      badgeText?: string;
      badgeColor?: string;
    }) => (
      <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 overflow-hidden px-4">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/15 blur-[120px] pointer-events-none" />
          <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 dark:bg-blue-950/15 blur-[120px] pointer-events-none" />
        </div>

        <div className="absolute inset-0 z-0 bg-grid-pattern opacity-60 dark:opacity-20 pointer-events-none" />

        <div className="relative z-10 w-full max-w-md bg-white/70 dark:bg-zinc-900/70 backdrop-blur-md border border-slate-200/50 dark:border-zinc-800/50 rounded-3xl p-8 shadow-2xl shadow-slate-200/30 dark:shadow-black/40 text-center">
          {badgeText && (
            <div className="mb-4 inline-flex items-center">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${badgeColor || 'bg-red-500/10 text-red-600 dark:text-red-400'}`}>
                {badgeText}
              </span>
            </div>
          )}

          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/30 mb-6">
            <Icon className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 mb-3">
            {title}
          </h1>

          <p className="text-sm text-slate-500 dark:text-zinc-400 mb-8 leading-relaxed">
            {description}
          </p>

          {actionLabel && actionHref && (
            <a
              href={actionHref}
              className="inline-flex w-full items-center justify-center px-5 py-3 border border-transparent text-sm font-semibold rounded-2xl text-white bg-indigo-600 hover:bg-indigo-500 transition duration-200 shadow-lg shadow-indigo-600/20 dark:shadow-indigo-600/10 hover:shadow-xl hover:shadow-indigo-600/30 dark:hover:shadow-indigo-600/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 cursor-pointer"
            >
              {actionLabel}
            </a>
          )}

          <div className="mt-8 border-t border-slate-100 dark:border-zinc-800/60 pt-6 flex justify-center items-center space-x-2 text-xs text-slate-400 dark:text-zinc-500">
            <Wrench className="h-3.5 w-3.5" />
            <span>Repair Management Platform</span>
          </div>
        </div>
      </div>
    );

    if (status === 404 || errorCode === "SHOP_NOT_FOUND") {
      return (
        <ErrorLayout
          icon={Globe}
          title="Workspace Not Found"
          badgeText="Status: Unregistered"
          description="We couldn't find a repair shop workspace registered under this subdomain. Please verify the URL or register your business."
          actionLabel="Register new store"
          actionHref={`${window.location.protocol}//www.atechlabs.it.com/signup`}
        />
      );
    }

    if (status === 402 || errorCode === "SUBSCRIPTION_SUSPENDED") {
      return (
        <ErrorLayout
          icon={CreditCard}
          title="Subscription Suspended"
          badgeText="Billing Action Required"
          badgeColor="bg-amber-500/10 text-amber-600 dark:text-amber-400"
          description="The subscription for this workspace has been suspended due to an outstanding payment or trial expiration. Please update billing details to restore access."
          actionLabel="Update Payment Details"
          actionHref={`${window.location.protocol}//www.atechlabs.it.com/billing`} // Redirect to global customer portal
        />
      );
    }

    if (status === 403 || errorCode === "SHOP_CLOSED") {
      return (
        <ErrorLayout
          icon={Lock}
          title="Workspace Closed"
          badgeText="Account Closed"
          description="This repair shop workspace has been closed or disabled by the administrator. Contact your team lead for more details."
        />
      );
    }

    return (
      <ErrorLayout
        icon={AlertTriangle}
        title="Workspace Unavailable"
        badgeText="Connection Error"
        badgeColor="bg-red-500/10 text-red-600 dark:text-red-400"
        description="We are currently unable to connect to your secure workspace. This could be due to a brief network disconnection or maintenance. Please try again."
        actionLabel="Refresh Workspace"
        actionHref={window.location.href}
      />
    );
  }

  return <>{children}</>;
};

export default TenantGuard;
