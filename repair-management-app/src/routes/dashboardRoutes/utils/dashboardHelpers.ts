// Helper for status colors
export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "received":
      return "#3b82f6"; // Blue
    case "diagnosing":
      return "#f59e0b"; // Amber
    case "repairing":
      return "#a855f7"; // Purple
    case "readyforpickup":
      return "#10b981"; // Emerald
    case "completed":
      return "#14b8a6"; // Teal
    case "cancelled":
      return "#ef4444"; // Red
    default:
      return "#64748b"; // Slate
  }
};

export const getStatusBg = (status: string) => {
  switch (status.toLowerCase()) {
    case "received":
      return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
    case "diagnosing":
      return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
    case "repairing":
      return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
    case "readyforpickup":
      return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
    case "completed":
      return "bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20";
    case "cancelled":
      return "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20";
    default:
      return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
  }
};
