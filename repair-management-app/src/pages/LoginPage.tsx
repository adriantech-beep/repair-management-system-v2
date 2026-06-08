import Login from "@/routes/loginRoutes/Login";
import { useGetPublicTenant } from "@/hooks/useTenants";

const LoginPage = () => {
  const { data: tenant } = useGetPublicTenant();
  const companyName = tenant?.companyName || "Repair Management System";

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center bg-slate-50 dark:bg-zinc-950 overflow-hidden px-4">
      {/* Background blobs for premium mesh effect */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute -top-[40%] -left-[20%] w-[80%] h-[80%] rounded-full bg-indigo-100/40 dark:bg-indigo-950/15 blur-[120px] pointer-events-none" />
        <div className="absolute -bottom-[30%] -right-[10%] w-[60%] h-[60%] rounded-full bg-blue-100/40 dark:bg-blue-950/15 blur-[120px] pointer-events-none" />
      </div>

      {/* Grid Pattern Overlay */}
      <div className="absolute inset-0 z-0 bg-grid-pattern opacity-60 dark:opacity-20 pointer-events-none" />

      {/* Main card & footer content wrapper */}
      <div className="relative z-10 w-full flex flex-col items-center">
        <Login />

        <div className="mx-auto mt-8 w-full max-w-3xl text-center text-xs text-muted-foreground/85">
          <p>
            Legal estimate information is provided for service records and
            internal operations only.
          </p>
          <p className="mt-1">
            © {new Date().getFullYear()} {companyName}. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
