import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { login } from "@/api/authApi";
import useAuthStore from "@/store/authStore";
import { loginSchema } from "@/routes/loginSchema";
import type { LoginFormData } from "@/routes/loginSchema";
import parseApiError from "@/api/parseApiError";

export function useLogin() {
  const navigate = useNavigate();
  const setAuth = useAuthStore((state) => state.setAuth);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      form.clearErrors("root");

      if (!navigator.onLine) {
        form.setError("root", {
          message: "No internet connection. Please reconnect and try again.",
        });
        return;
      }

      const response = await login(data.email, data.password);
      setAuth(response.accessToken, response.refreshToken, response.user);
      navigate("/dashboard", { replace: true });
    } catch (error) {
      const parsedError = parseApiError(error);

      if (parsedError.fieldErrors) {
        for (const [fieldName, messages] of Object.entries(
          parsedError.fieldErrors,
        )) {
          const normalized = fieldName.toLowerCase();
          const firstMessage = messages[0];

          if (!firstMessage) {
            continue;
          }

          if (normalized === "email" || normalized === "password") {
            form.setError(normalized, { message: firstMessage });
          }
        }
      }

      form.setError("root", {
        message: parsedError.message ?? "Unable to log in. Please try again.",
      });
    }
  };

  return { form, onSubmit };
}
