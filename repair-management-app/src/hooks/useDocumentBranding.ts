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

      // Set matching MIME type dynamically based on file format
      if (logoUrl.endsWith(".svg")) {
        link.setAttribute("type", "image/svg+xml");
      } else if (logoUrl.endsWith(".png")) {
        link.setAttribute("type", "image/png");
      } else if (logoUrl.endsWith(".webp")) {
        link.setAttribute("type", "image/webp");
      } else if (logoUrl.endsWith(".ico")) {
        link.setAttribute("type", "image/x-icon");
      } else {
        // Remove type attribute for JPG or other formats, letting the browser auto-detect
        link.removeAttribute("type");
      }
    }
  }, [tenant]);
}
