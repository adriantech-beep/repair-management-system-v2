import { Input } from "@/components/ui/input";
import type { LoginFormData } from "./loginSchema";
import { Mail, Lock } from "lucide-react";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";

type FieldConfig = {
  name: keyof LoginFormData;
  placeholder: string;
  type: string;
};

const userInfoFields: FieldConfig[] = [
  {
    name: "email",
    placeholder: "Username or Email",
    type: "email",
  },
  {
    name: "password",
    placeholder: "Password",
    type: "password",
  },
];

const LoginFields = () => {
  const { control } = useFormContext<LoginFormData>();
  return (
    <div className="space-y-4">
      {userInfoFields.map(({ name, placeholder, type }) => (
        <FormField
          key={name}
          control={control}
          name={name}
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-base font-medium text-emerald-950/80">
                {name === "email" ? "Username or Email" : "Password"}
              </FormLabel>

              <div className="relative">
                {name === "email" ? (
                  <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-900/45" />
                ) : (
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-emerald-900/45" />
                )}

                <FormControl>
                  <Input
                    type={type}
                    placeholder={placeholder}
                    className="h-11 rounded-xl border-emerald-900/15 bg-white/70 pl-10 text-[15px] placeholder:text-emerald-900/40 focus-visible:border-emerald-600 focus-visible:ring-emerald-200"
                    {...field}
                    value={(field.value as string | undefined) ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
              </div>

              <FormMessage className="mt-1 text-sm text-red-600" />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default LoginFields;
