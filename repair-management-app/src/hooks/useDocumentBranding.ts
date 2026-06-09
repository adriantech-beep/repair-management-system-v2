import { useEffect } from "react";
import { useGetPublicTenant } from "./useTenants";

export function useDocumentBranding() {
  const { data: tenant } = useGetPublicTenant();

  useEffect(() => {
    const companyName = tenant?.companyName || "Repair Management System";
    const logoUrl = tenant?.logoUrl || "/favicon.svg";

    document.title = companyName;

    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = logoUrl;

      if (logoUrl.endsWith(".svg")) {
        link.setAttribute("type", "image/svg+xml");
      } else if (logoUrl.endsWith(".png")) {
        link.setAttribute("type", "image/png");
      } else if (logoUrl.endsWith(".webp")) {
        link.setAttribute("type", "image/webp");
      } else if (logoUrl.endsWith(".ico")) {
        link.setAttribute("type", "image/x-icon");
      } else {
        link.removeAttribute("type");
      }
    }
  }, [tenant]);
}
