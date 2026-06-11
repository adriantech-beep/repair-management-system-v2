import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, User } from "lucide-react";
import useAuthStore from "@/store/authStore";
import { logout } from "@/api/authApi";
import { useNavigate } from "react-router-dom";

const AccountAvatar = () => {
  const navigate = useNavigate();
  const user = useAuthStore((state) => state.user);
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const clearAuth = useAuthStore((state) => state.clearAuth);

  const initials = user?.fullName
    ? user.fullName
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
    : "PH";

  const handleLogout = async () => {
    try {
      if (accessToken && refreshToken) {
        await logout(accessToken, refreshToken);
      }
    } finally {
      clearAuth();
      navigate("/login", { replace: true });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="flex items-center gap-2.5 cursor-pointer hover:opacity-85 active:scale-98 transition select-none outline-none">
          <Avatar className="h-8.5 w-8.5 border border-slate-200 dark:border-zinc-800 shadow-sm">
            <AvatarFallback className="bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-bold text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start text-left leading-none">
            <span className="text-xs font-bold text-slate-800 dark:text-zinc-200">
              {user?.fullName ?? "User"}
            </span>
            <span className="text-[10px] text-slate-400 dark:text-zinc-500 font-semibold capitalize mt-0.5">
              {user?.role ?? "Guest"}
            </span>
          </div>
          <ChevronDown className="h-4 w-4 text-slate-400 shrink-0" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 mt-1.5 rounded-2xl bg-white dark:bg-zinc-950 border border-slate-200 dark:border-zinc-800 shadow-lg">
        <DropdownMenuLabel className="font-normal px-3 py-2.5">
          <div className="flex flex-col space-y-1">
            <p className="text-xs font-bold text-slate-900 dark:text-zinc-50 leading-none">
              {user?.fullName ?? "User"}
            </p>
            <p className="text-[10px] text-slate-500 dark:text-zinc-400 leading-none truncate">
              {user?.email ?? ""}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-850" />
        <DropdownMenuGroup className="p-1">
          <DropdownMenuItem className="text-xs font-semibold px-2.5 py-2 rounded-lg cursor-pointer flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-zinc-900">
            <User className="h-4 w-4 text-slate-450" />
            <span>Profile Settings</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-slate-100 dark:bg-zinc-850" />
        <div className="p-1">
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-xs font-bold px-2.5 py-2 rounded-lg text-red-650 focus:text-red-600 focus:bg-red-50 dark:text-red-400 dark:focus:text-red-400 dark:focus:bg-red-950/20 cursor-pointer flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountAvatar;
