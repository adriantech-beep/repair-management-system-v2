import { Input } from "@/components/ui/input";
import { Mail, Lock } from "lucide-react";

import { useFormContext } from "react-hook-form";
import {
  FormField,
  FormLabel,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import type { LoginFormData } from "./loginSchema";

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
              <FormLabel className="text-base font-medium text-slate-800 dark:text-zinc-300">
                {name === "email" ? "Username or Email" : "Password"}
              </FormLabel>

              <div className="relative">
                {name === "email" ? (
                  <Mail className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                ) : (
                  <Lock className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
                )}

                <FormControl>
                  <Input
                    type={type}
                    placeholder={placeholder}
                    className="h-11 rounded-xl border-slate-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-800/40 pl-10 text-[15px] placeholder:text-slate-400 dark:placeholder:text-zinc-500 focus-visible:border-indigo-500 focus-visible:ring-indigo-100 dark:focus-visible:ring-indigo-950"
                    {...field}
                    value={(field.value as string | undefined) ?? ""}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                </FormControl>
              </div>

              <FormMessage className="mt-1 text-sm text-destructive" />
            </FormItem>
          )}
        />
      ))}
    </div>
  );
};

export default LoginFields;
