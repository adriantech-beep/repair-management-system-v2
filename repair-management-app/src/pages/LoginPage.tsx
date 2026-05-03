import Login from "@/routes/Login";
import BackgroundIMage from "@/image-assets/PINES_MULTI_TELECOM_BG.png";

const LoginPage = () => {
  return (
    <div
      className="h-screen flex flex-col items-center justify-center"
      style={{
        backgroundImage: `url(${BackgroundIMage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <Login />

      <div className="mx-auto mt-8 w-full max-w-3xl text-center text-xs text-emerald-950/65">
        <p>
          Legal estimate information is provided for service records and
          internal operations only.
        </p>
        <p className="mt-1">
          © 2026 Pines Multi Telecom Shop. All rights reserved.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
