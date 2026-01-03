import { useEffect, useState } from "react";
import LoginCard from "../components/LoginCard";
import SignUpCard from "../components/SignUpCard";
import NavBar from "../components/NavBar";
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
      <NavBar sidebarOpen={false} setSidebarOpen={() => {}} isLogged={!!user} />
      <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-background-light dark:bg-background-dark">
        <div className="p-6 lg:p-10 flex flex-col justify-center">
          <div className="max-w-xl">
            <h1 className="text-3xl lg:text-4xl font-extrabold text-brand-light dark:text-brand-dark mb-4">
              ConstructHub — Your Construction Companion
            </h1>
            <p className="text-gray-900 dark:text-gray-100 mb-4 lg:text-lg leading-7">
              Get accurate cost estimates, verified technicians, and trusted vendors around you.
            </p>
            <p className="text-gray-900 dark:text-gray-100 mb-6 lg:text-lg">
              Already have an account? Log in to view your estimates and connect with nearby pros.
            </p>

            <div className="text-gray-900 dark:text-gray-100 my-6 lg:text-base leading-7">
              <p className="mb-4">
                ConstructHub simplifies planning and execution by bringing cost estimation tools, vendor marketplaces, and
                trusted professional services in one place.
              </p>
              <p>{description}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 flex items-center justify-center p-6 lg:p-10">
          <div className="w-full max-w-md space-y-4">
            <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  mode === "login" ? "bg-white dark:bg-gray-700 shadow" : "text-gray-500"
                }`}
                onClick={() => setMode("login")}
              >
                Login
              </button>
              <button
                className={`flex-1 py-2 rounded-md text-sm font-medium ${
                  mode === "signup" ? "bg-white dark:bg-gray-700 shadow" : "text-gray-500"
                }`}
                onClick={() => setMode("signup")}
              >
                Sign Up
              </button>
            </div>

            {localError || authError ? (
              <div className="text-red-500 text-sm">{localError || authError}</div>
            ) : null}

            <div className="bg-background-light dark:bg-background-dark rounded-xl shadow p-4">
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
            {loading && <div className="text-gray-500 text-sm">Processing...</div>}
          </div>
        </div>
      </div>
    </>
  );
};

export default AuthLayout;


