import { useEffect } from "react";
import { useGetPublicTenant } from "./useTenants";

export function useDocumentBranding() {
  const { data: tenant } = useGetPublicTenant();

  useEffect(() => {
    // Determine the active company name and logo with safe default fallbacks
    const companyName = tenant?.companyName || "Repair Management System";
    const logoUrl = tenant?.logoUrl || "/favicon.svg";

    // Update Browser Tab Title
    document.title = companyName;

    // Locate and update the favicon link in the head
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement;
    if (link) {
      link.href = logoUrl;
    }
  }, [tenant]);
}
