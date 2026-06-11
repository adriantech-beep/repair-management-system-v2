import UsersTable from "./UsersTable";
import CreateUserForm from "./CreateUserForm";
import { Users } from "lucide-react";

const UserManagement = () => {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-1.5">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-50 sm:text-3xl flex items-center gap-2.5">
          <Users className="h-8 w-8 text-indigo-650 dark:text-indigo-400" /> User Management
        </h1>
        <p className="text-sm text-slate-500 dark:text-zinc-400">
          Manage your tenant's staff accounts, view active roles, and register new team members.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <UsersTable />
        <CreateUserForm />
      </div>
    </div>
  );
};

export default UserManagement;
