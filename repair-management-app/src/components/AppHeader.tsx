import AccountAvatar from "./AccountAvatar";

const AppHeader = () => {
  return (
    <div className="w-full flex gap-4 justify-end px-4 py-2 border-b">
      <AccountAvatar />
    </div>
  );
};

export default AppHeader;
