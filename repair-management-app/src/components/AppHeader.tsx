import AccountAvatar from "./AccountAvatar";
// import SearchCustomer from "./SearchCustomer";

const AppHeader = () => {
  return (
    <div className="w-full flex gap-4 justify-end px-4 py-2 border-b">
      {/* <SearchCustomer /> */}
      <AccountAvatar />
    </div>
  );
};

export default AppHeader;
