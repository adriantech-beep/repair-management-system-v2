import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { 
  CheckCircle, 
  Loader2, 
  Globe, 
  ArrowRight, 
  Terminal, 
  UserCheck, 
  Sparkles,
  ExternalLink
} from "lucide-react";
import apiClient from "@/api/httpClient";
import parseApiError from "@/api/parseApiError";

interface SessionDetails {
  subdomain: string;
  companyName: string;
  email: string;
}

const OnboardingSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [details, setDetails] = useState<SessionDetails | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (!sessionId) {
        // Fallback for demo testing if someone visits the success URL directly
        setDetails({
          subdomain: "demo-shop",
          companyName: "Demo Repair Co.",
          email: "owner@demorepair.com"
        });
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const response = await apiClient.get<SessionDetails>(
          `/api/onboarding/session-details`,
          { params: { sessionId } }
        );
        setDetails(response.data);
      } catch (err) {
        const parsed = parseApiError(err);
        setError(parsed.message ?? "Failed to retrieve onboarding details.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [sessionId]);

  const isLocalhost = 
    window.location.hostname === "localhost" || 
    window.location.hostname === "127.0.0.1";

  // Production Workspace Login URL
  const productionLoginUrl = details 
    ? `https://${details.subdomain}.atechlabs.it.com/login` 
    : "https://www.atechlabs.it.com/login";

  return (
    <div className="flex min-h-screen bg-[#070b13] font-body text-slate-100 antialiased overflow-hidden relative">
      {/* Background Lighting Glows */}
      <div className="absolute top-[-20%] left-[-10%] w-[500px] h-[500px] rounded-full bg-blue-500/10 blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-violet-600/10 blur-[150px] pointer-events-none" />

      <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto px-4 py-8 lg:py-16 relative z-10 text-center">
        
        {/* Loading Spinner View */}
        {loading && (
          <div className="space-y-6">
            <Loader2 className="h-16 w-16 text-blue-500 animate-spin mx-auto" />
            <div className="space-y-2">
              <h2 className="text-xl font-bold font-display text-white">Validating Stripe Invoice</h2>
              <p className="text-slate-400 text-sm max-w-sm mx-auto">
                Please wait while Atechlabs provisions your isolated database container and maps your subdomain DNS...
              </p>
            </div>
          </div>
        )}

        {/* Error / Fallback Info */}
        {!loading && error && (
          <div className="w-full rounded-3xl border border-red-500/20 bg-red-500/5 p-8 space-y-6">
            <CheckCircle className="h-12 w-12 text-amber-500 mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold font-display text-white">DNS Provisioning in Progress</h2>
              <p className="text-slate-300 text-sm">
                Your Stripe billing succeeded, but Stripe is currently verifying the payout webhook events. 
              </p>
              <p className="text-slate-400 text-xs">
                {error}
              </p>
            </div>
            
            <div className="p-4 rounded-xl border border-slate-700 bg-slate-900/60 text-left text-xs font-mono space-y-2 text-slate-300">
              <div className="flex items-center gap-2 text-blue-400 font-bold border-b border-slate-800 pb-1.5 mb-1.5">
                <Terminal className="h-4 w-4" />
                <span>Next Onboarding Action Steps</span>
              </div>
              <p>✓ Check your email address for your secure login link.</p>
              <p>✓ If running locally, wait for the `stripe-cli` webhook listener to output success.</p>
              <p>✓ Or click below to try accessing your central operations panel.</p>
            </div>

            <Link
              to="/login"
              className="inline-flex h-11 px-6 rounded-xl text-sm font-bold bg-slate-800 border border-slate-700 text-white items-center gap-2 hover:bg-slate-700 transition-all cursor-pointer"
            >
              Go to Central Login
            </Link>
          </div>
        )}

        {/* Success Onboarding Console */}
        {!loading && !error && details && (
          <div className="w-full space-y-8 animate-fadeIn">
            
            {/* Pulsing High-Tech Logo Header */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-500/25 bg-emerald-500/5 text-xs font-semibold text-emerald-400 uppercase tracking-wider font-mono">
                <Sparkles className="h-3 w-3 animate-spin" /> Tenant Provisioned Successfully
              </div>
              
              <h1 className="text-4xl font-extrabold text-white tracking-tight font-display">
                ATECH<span className="text-blue-500">LABS</span>
              </h1>
            </div>

            {/* Premium Frosted Glass Success Card */}
            <div className="w-full rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl shadow-2xl p-8 space-y-6 text-left">
              
              {/* Animated Checkmark Shield */}
              <div className="text-center pb-2">
                <div className="inline-flex items-center justify-center p-4 rounded-full border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)] animate-bounce mb-3">
                  <CheckCircle className="h-10 w-10" />
                </div>
                <h2 className="text-2xl font-bold font-display text-white">
                  Welcome to Atechlabs, {details.companyName}!
                </h2>
                <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
                  Your isolated cloud workspace has been securely prepared.
                </p>
              </div>

              <div className="h-[1px] w-full bg-slate-800" />

              {/* Workspace URL details */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">
                    Dedicated Store URL
                  </span>
                  <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-900/60 font-mono text-sm text-blue-400 flex items-center justify-between">
                    <div className="flex items-center gap-2 overflow-hidden truncate">
                      <Globe className="h-4 w-4 text-slate-500 shrink-0" />
                      <span className="truncate">{productionLoginUrl}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span className="text-xs font-semibold text-slate-400 tracking-wide uppercase font-mono">
                    Primary Admin Account
                  </span>
                  <div className="p-3.5 rounded-xl border border-slate-700 bg-slate-900/60 text-sm text-slate-200 flex items-center gap-2">
                    <UserCheck className="h-4 w-4 text-slate-500 shrink-0" />
                    <span>{details.email}</span>
                  </div>
                </div>
              </div>

              {/* Environment Guidance Alert */}
              {isLocalhost ? (
                <div className="p-4 rounded-2xl border border-amber-500/20 bg-amber-500/5 text-xs text-amber-300 space-y-2 leading-relaxed">
                  <p className="font-bold flex items-center gap-1.5">
                    ⚙️ Local Development Sandbox Detected
                  </p>
                  <p>
                    Because you are working in local development, subdomains cannot be auto-resolved directly on the internet. 
                  </p>
                  <p>
                    To test your new workspace locally, you can click the helper button below to log in directly using the local login page with your newly created credentials: <span className="font-mono bg-slate-800 px-1 py-0.5 rounded border border-slate-700 text-amber-200">{details.email}</span>
                  </p>
                </div>
              ) : (
                <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-xs text-slate-300 leading-relaxed">
                  <p className="font-bold text-blue-400">
                    🌐 Production Domain Mapping
                  </p>
                  <p className="mt-1">
                    Your subdomain is now active! Visiting this URL will automatically load your company logo and isolated database partition context for all clients and technicians.
                  </p>
                </div>
              )}

              {/* 7. Action Button */}
              {isLocalhost ? (
                <Link
                  to="/login"
                  className="h-12 w-full rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 transition-all duration-300 text-white shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Go to Local Login Desk
                  <ArrowRight className="h-4 w-4" />
                </Link>
              ) : (
                <a
                  href={productionLoginUrl}
                  className="h-12 w-full rounded-xl text-sm font-bold uppercase tracking-wider flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-violet-600 hover:from-blue-600 hover:to-violet-700 transition-all duration-300 text-white shadow-lg cursor-pointer hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                >
                  Access Your Operations Desk
                  <ExternalLink className="h-4 w-4" />
                </a>
              )}
            </div>

            <div className="text-center">
              <Link to="/login" className="text-xs text-slate-500 hover:underline hover:text-slate-400">
                Cancel & return to Central Console
              </Link>
            </div>

          </div>
        )}

      </div>
    </div>
  );
};

export default OnboardingSuccessPage;
