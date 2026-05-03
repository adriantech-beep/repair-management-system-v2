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
import { useLogin } from "@/hooks/useLogin";
import LoginFields from "./LoginFields";
import CompanyLogo from "@/image-assets/PINES_MULTI_TELECOM.jpg";

const Login = () => {
  const { form, onSubmit } = useLogin();

  return (
    <FormProvider {...form}>
      <Card className="overflow-visible relative w-full max-w-lg rounded-3xl border border-white/40 bg-white/75 shadow-2xl backdrop-blur-md">
        {/* <div> */}
        <img
          src={CompanyLogo}
          alt="Pines Multi Telecom Shop"
          className="absolute -top-14 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full  shadow-lg"
        />
        {/* </div> */}

        <CardHeader className="pt-16 text-center">
          <CardTitle className="text-2xl font-bold leading-tight text-emerald-950">
            Welcome to Pines Multi Telecom Shop.
          </CardTitle>
          <CardDescription className="text-base text-emerald-900/70">
            Access your account with ease.
          </CardDescription>
        </CardHeader>

        <CardContent className="pb-4">
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3">
            <LoginFields />

            {form.formState.errors.root?.message ? (
              <p className="text-sm font-medium text-red-600">
                {form.formState.errors.root.message}
              </p>
            ) : null}

            <div className="flex justify-end">
              <a
                href="#"
                className="text-sm text-emerald-950/80 underline underline-offset-2 hover:text-emerald-950"
              >
                Forgot password?
              </a>
            </div>

            <CardFooter className="flex-col gap-4 px-0 pt-2">
              <Button
                type="submit"
                className="h-11 w-full rounded-full bg-green-500 text-base font-semibold tracking-wide text-white hover:bg-green-600"
                disabled={form.formState.isSubmitting}
              >
                {form.formState.isSubmitting ? "LOGGING IN..." : "LOG IN"}
              </Button>

              <p className="text-center text-sm text-emerald-950/80">
                Don&apos;t have an account?{" "}
                <a
                  href="#"
                  className="font-semibold text-emerald-950 hover:underline"
                >
                  Sign Up Now.
                </a>
              </p>
            </CardFooter>
          </form>
        </CardContent>
      </Card>
    </FormProvider>
  );
};

export default Login;
