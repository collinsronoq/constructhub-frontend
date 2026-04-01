import { useEffect, useState } from "react";
import LoginCard from "../components/LoginCard";
import SignUpCard from "../components/SignUpCard";
import NavBar from "../components/Navbar";
import { useAuth } from "../hooks/auth/useAuth";
import { useNavigate } from "react-router-dom";

interface AuthLayoutProps {
  description: string;
}

const AuthLayout = ({ description }: AuthLayoutProps) => {
  const [mode, setMode] = useState<"login" | "signup">("login");
  const { user, login, register, error: authError, loading } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);
  const navigate = useNavigate();

  const roleLanding = (role?: string) => {
    switch (role) {
      case "vendor":
        return "/vendor/profile";
      case "technician":
        return "/technician/profile";
      case "builder":
      default:
        return "/dashboard";
    }
  };

  useEffect(() => {
    if (user) navigate(roleLanding(user.role), { replace: true });
  }, [user, navigate]);

  return (
    <>
      <NavBar
        sidebarOpen={false}
        setSidebarOpen={() => {}}
        isLogged={!!user}
        className="bg-gray-500 dark:bg-gray-950/90 backdrop-blur border-b border-gray-200 dark:border-gray-800"
      />
      <div className="min-h-[calc(100vh-4rem)] grid grid-cols-1 lg:grid-cols-2 bg-gradient-to-br from-blue-50 via-white to-slate-100 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950">
        {/* Hero / marketing */}
        <div className="relative p-8 lg:p-12 flex flex-col justify-center text-gray-900 dark:text-gray-50 overflow-hidden">
          <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(circle_at_top_left,_#60a5fa,_transparent_40%),radial-gradient(circle_at_bottom_right,_#c084fc,_transparent_40%)]" />
          <div className="relative max-w-xl space-y-6">
            <p className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] font-semibold text-blue-700 dark:text-blue-300 bg-white/70 dark:bg-gray-900/60 px-3 py-1 rounded-full shadow-sm border border-blue-100 dark:border-gray-800">
              Build faster · Plan smarter
            </p>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight">
              ConstructHub is your all-in-one companion for planning and building with confidence.
            </h1>
            <p className="text-lg text-gray-700 dark:text-gray-200 leading-7">
              Accurate cost estimates, vetted technicians, trusted vendors, and a streamlined marketplace—all in one place.
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-200">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                Generate phase-by-phase estimates with clear breakdowns.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                Discover verified vendors and technicians near your site.
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-blue-500" />
                Manage articles, tips, and marketplace items in one dashboard.
              </li>
            </ul>
            <p className="text-sm text-gray-600 dark:text-gray-300">{description}</p>
          </div>
        </div>

        {/* Auth card */}
        <div className="bg-transparent backdrop-blur flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md space-y-5">
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
              <button
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                  mode === "login" ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100" : "text-gray-500"
                }`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 rounded-md text-sm font-semibold transition ${
                  mode === "signup" ? "bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-gray-100" : "text-gray-500"
                }`}
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </div>

            {localError || authError ? (
              <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-800 rounded-md px-3 py-2">
                {localError || authError}
              </div>
            ) : null}

            <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl border border-gray-200 dark:border-gray-800 p-6">
              {mode === "login" ? (
                <LoginCard
                  onSwitch={() => setMode("signup")}
                  onLogin={async ({ email, password }) => {
                    try {
                      setLocalError(null);
                      const res = await login({ email, password });
                      navigate(roleLanding(res.user?.role), { replace: true });
                    } catch (err: any) {
                      setLocalError(err?.detail || "Login failed");
                    }
                  }}
                />
              ) : (
                <SignUpCard
                  onSwitch={() => setMode("login")}
                  onSignUp={async ({ username, email, password, role }) => {
                    try {
                      setLocalError(null);
                      const res = await register({ name: username, email, password, role: role as any });
                      navigate(roleLanding(res.user?.role), { replace: true });
                    } catch (err: any) {
                      setLocalError(err?.detail || "Sign up failed");
                    }
                  }}
                />
              )}
            </div>
            {loading && <div className="text-gray-500 dark:text-gray-400 text-sm">Processing...</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;
