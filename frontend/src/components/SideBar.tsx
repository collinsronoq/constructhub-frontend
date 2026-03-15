import { Package, PackagePlus, Warehouse } from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/auth/useAuth";
import { useMemo } from "react";

type SideBarProps = {
  onLinkClick?: () => void;
};

const SideBar = ({ onLinkClick }: SideBarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const linkClass = (path: string) =>
    `inline-flex items-center w-full text-xs md:text-sm font-medium border-b border-slate-200 dark:border-slate-200/10 gap-x-4 px-4 py-4 hover:bg-gray-200 dark:hover:bg-gray-700 rounded ${location.pathname === path ? "bg-blue-200 dark:bg-blue-600 text-gray-800 dark:text-gray-100 font-bold" : ""}`;

  const navItems = useMemo(() => {
    if (user?.role === "technician") {
      return [
        {
          to: "/technician/profile",
          label: "Profile",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
              <path d="M5.5 21h13a2 2 0 0 0 2-2 7 7 0 0 0-7-7h-3a7 7 0 0 0-7 7 2 2 0 0 0 2 2Z" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
        },
        {
          to: "/technicians",
          label: "Technician Directory",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
              <path d="M10 13a5 5 0 1 0-8 0" />
              <circle cx="4" cy="6" r="3" />
              <path d="M22 13a5 5 0 0 0-8 0" />
              <circle cx="18" cy="6" r="3" />
              <path d="M14 13a5 5 0 0 0-4 0" />
              <circle cx="10" cy="6" r="3" />
            </svg>
          ),
        },
        {
          to: "/marketplace",
          label: "Marketplace",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
              <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
              <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
              <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
            </svg>
          ),
        },
        {
          to: "/articles",
          label: "Read Articles",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
              <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
              <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
              <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
            </svg>
          ),
        },
      ];
    }
    if (user?.role === "vendor") {
      return [
        {
          to: "/vendor/profile",
          label: "Profile",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
              <path d="M5.5 21h13a2 2 0 0 0 2-2 7 7 0 0 0-7-7h-3a7 7 0 0 0-7 7 2 2 0 0 0 2 2Z" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          ),
        },
        { to: "/vendor/items", label: "My Items", icon: <Package size={20} /> },
        {
          to: "/marketplace",
          label: "Marketplace",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
              <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
              <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
              <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
            </svg>
          ),
        },
        {
          to: "/articles",
          label: "Read Articles",
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
              <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
              <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
              <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
            </svg>
          ),
        },
      ];
    }
    // default (builder/admin)
    return [
      {
        to: "/dashboard",
        label: "Dashboard",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
            <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" />
            <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
        ),
      },
      { to: "/estimates", label: "Estimates", icon: <Package size={20} /> },
      { to: "/estimate", label: "Get Estimate", icon: <PackagePlus size={20} /> },
      { to: "/vendors", label: "Vendors", icon: <Warehouse size={20} /> },
      {
        to: "/technicians",
        label: "Technicians",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
            <path d="M10 13a5 5 0 1 0-8 0" />
            <circle cx="4" cy="6" r="3" />
            <path d="M22 13a5 5 0 0 0-8 0" />
            <circle cx="18" cy="6" r="3" />
            <path d="M14 13a5 5 0 0 0-4 0" />
            <circle cx="10" cy="6" r="3" />
          </svg>
        ),
      },
      {
        to: "/marketplace",
        label: "Marketplace",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
            <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
            <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
            <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
          </svg>
        ),
      },
      {
        to: "/articles",
        label: "Read Articles",
        icon: (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 ">
            <path d="M15 21v-5a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v5" />
            <path d="M17.774 10.31a1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.451 0 1.12 1.12 0 0 0-1.548 0 2.5 2.5 0 0 1-3.452 0 1.12 1.12 0 0 0-1.549 0 2.5 2.5 0 0 1-3.77-3.248l2.889-4.184A2 2 0 0 1 7 2h10a2 2 0 0 1 1.653.873l2.895 4.192a2.5 2.5 0 0 1-3.774 3.244" />
            <path d="M4 10.95V19a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8.05" />
          </svg>
        ),
      },
    ];
  }, [user]);

  return (
    <aside className="w-64 bg-surface-light dark:bg-surface-dark border-l-1 h-full relative rounded-lg md:rounded-none">
      <div className="flex items-center border-b border-slate-200 dark:border-slate-200/10 px-4 py-2 h-16 text-base font-bold text-brand-light dark:text-brand-dark">
        MENU
      </div>
      <div>
        <button
          onClick={onLinkClick}
          className="absolute top-3 right-3 pl-4 pr-2 py-2 md:hidden text-gray-800 dark:text-gray-100 dark:hover:text-white hover:text-gray-900"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-x-icon lucide-x">
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </button>
      </div>
      <nav className="mt-5 pl-4">
        {navItems.map((item) => (
          <Link key={item.to} onClick={onLinkClick} to={item.to} className={linkClass(item.to)}>
            {item.icon}
            <span>{item.label}</span>
          </Link>
        ))}
        <button
          onClick={async () => {
            await logout();
            if (onLinkClick) onLinkClick();
            navigate("/login");
          }}
          className="inline-flex items-center w-full text-xs md:text-sm font-medium border-b border-slate-200 dark:border-slate-200/10 gap-x-4 px-4 py-4 hover:bg-gray-200 dark:hover:bg-gray-700 rounded text-red-600"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-log-out size-4 md:size-5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          <span>Logout</span>
        </button>
      </nav>
    </aside>
  );
};

export default SideBar;
