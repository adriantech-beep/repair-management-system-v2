import { useMemo, useState } from "react";
import TypedTable from "@/context/Table";
import { useGetUsers } from "@/hooks/useUsers";
import { useGetBranches } from "@/hooks/useDashboard";
import { Input } from "@/components/ui/input";
import UserList from "./UserList";

const UsersTable = () => {
  const { data: users = [], isLoading, isError } = useGetUsers();
  const { data: branches = [] } = useGetBranches();

  const [searchTerm, setSearchTerm] = useState("");
  const normalizedSearch = searchTerm.trim().toLowerCase();

  const getBranchName = (branchId: string | null) => {
    if (!branchId) return "All Branches";
    const branch = branches.find((b) => b.id === branchId);
    return branch ? branch.name : "Unknown Branch";
  };

  const filteredUsers = useMemo(() => {
    if (!normalizedSearch) return users;

    return users.filter((user) => {
      const branchName = getBranchName(user.branchId);
      return [
        user.fullName,
        user.email,
        user.role,
        branchName,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(normalizedSearch));
    });
  }, [users, normalizedSearch, branches]);

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-sm text-slate-500 dark:text-zinc-400 shadow-sm">
        Loading users...
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-red-100 dark:border-red-950/20 bg-red-50 dark:bg-red-950/10 p-6 text-sm text-red-700 dark:text-red-400">
        Unable to load users.
      </div>
    );
  }

  return (
    <section className="space-y-4 border border-slate-100/70 dark:border-zinc-800 bg-white dark:bg-zinc-900/30 p-4 shadow-sm sm:p-6 rounded-2xl">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-zinc-50">Staff Accounts</h2>
          <p className="text-sm text-slate-500 dark:text-zinc-400">
            {filteredUsers.length} shown
            {normalizedSearch ? " (filtered)" : ""}
          </p>
        </div>

        <Input
          type="search"
          value={searchTerm}
          onChange={(event) => setSearchTerm(event.target.value)}
          aria-label="Search users"
          placeholder="Search by name, email, role or branch"
          className="h-10 w-full sm:max-w-xs bg-white dark:bg-zinc-950 border-slate-200 dark:border-zinc-850"
        />
      </div>

      <TypedTable columns="1.2fr 1.3fr 1fr 1fr">
        <TypedTable.Header>
          <div>Name</div>
          <div>Email</div>
          <div>Role</div>
          <div>Branch</div>
        </TypedTable.Header>

        <TypedTable.Body
          data={filteredUsers}
          resourceName="users"
          render={(user) => (
            <UserList 
              user={user} 
              branchName={getBranchName(user.branchId)} 
              key={user.id} 
            />
          )}
        />
      </TypedTable>
    </section>
  );
};

export default UsersTable;
