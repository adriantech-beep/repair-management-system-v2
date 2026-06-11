import TypedTable from "@/context/Table";
import type { AuthUser } from "@/types/user";

type UserRowProps = {
  user: AuthUser;
  branchName: string;
};

const UserList = ({ user, branchName }: UserRowProps) => {
  const { fullName, email, role } = user;

  return (
    <TypedTable.Row>
      <p className="truncate font-medium text-slate-900 dark:text-zinc-150">{fullName}</p>
      <p className="truncate text-slate-600 dark:text-zinc-400">{email}</p>
      <span className="capitalize text-slate-700 dark:text-zinc-300">{role.toLowerCase()}</span>
      <p className="truncate text-slate-600 dark:text-zinc-400">{branchName}</p>
    </TypedTable.Row>
  );
};

export default UserList;
