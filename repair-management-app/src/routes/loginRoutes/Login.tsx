import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormProvider } from "react-hook-form";
import { Link } from "react-router-dom";
import { useLogin } from "@/hooks/useLogin";
import { useGetPublicTenant } from "@/hooks/useTenants";
import { Wrench } from "lucide-react";
import LoginFields from "./LoginFields";

const Login = () => {
  const { form, onSubmit } = useLogin();
  const { data: tenant, isLoading } = useGetPublicTenant();

  const companyName = tenant?.companyName || "Repair Management System";
  const logoUrl = tenant?.logoUrl;

  return (
    <FormProvider {...form}>
      <Card className="overflow-visible relative w-full max-w-lg rounded-3xl border border-slate-200/50 dark:border-zinc-800 bg-white/75 dark:bg-zinc-900/75 shadow-2xl backdrop-blur-md">
        {/* Dynamic Brand Logo / Fallback Avatar */}
        <div className="absolute -top-14 left-1/2 -translate-x-1/2">
          {logoUrl ? (
            <img
              src={logoUrl}
              alt={companyName}
              className="h-24 w-24 rounded-full border-2 border-white dark:border-zinc-800 bg-white object-contain shadow-lg"
            />
          ) : (
            <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white dark:border-zinc-800 bg-indigo-600 text-white shadow-lg">
              <Wrench className="h-10 w-10 animate-pulse" />
            </div>
          )}
        </div>

        <CardHeader className="pt-16 text-center">
          <CardTitle className="text-2xl font-bold leading-tight text-slate-900 dark:text-zinc-50">
            {isLoading ? "Loading..." : `Welcome to ${companyName}`}
          </CardTitle>
          <CardDescription className="text-base text-slate-600 dark:text-zinc-400">
            Access your account with ease.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <LoginFields />

            {form.formState.errors.root?.message ? (
              <p className="text-sm font-medium text-destructive">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm text-slate-600 dark:text-zinc-400 underline underline-offset-2 hover:text-slate-900 dark:hover:text-zinc-50"
              >
                Forgot password?
              </a>
            </div>

            <CardFooter className="flex-col gap-4 px-0 pt-2">
              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-indigo-600 text-base font-semibold tracking-wide text-white hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 cursor-pointer transition-colors"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "LOGGING IN..." : "LOG IN"}
              </Button>

              <p className="text-center text-sm text-slate-600 dark:text-zinc-400">
                Don&apos;t have an account?{" "}
                <Link
                  to="/signup"
                  className="font-semibold text-slate-900 dark:text-zinc-100 hover:underline"
                >
                  Sign Up Now.
                </Link>
              </p>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

export default Login;
