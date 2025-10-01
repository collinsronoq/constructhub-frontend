import { useState } from "react"
import { Link, Outlet } from "react-router-dom"

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside
        className={`fixed z-20 inset-y-0 left-0 w-64 transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 transition-transform duration-200 ease-in-out bg-surface-light dark:bg-surface-dark shadow-lg`}
      >
        <div className="flex items-center justify-center h-16 text-2xl font-bold text-brand-light dark:text-brand-dark">
          ConstructHub
        </div>
        <nav className="mt-5">
          <Link
            to="/dashboard"
            className="flex text-center justify-content-center gap-x-4 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-house-icon lucide-house"><path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"/><path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/></svg>

            <span>Dashboard</span>
          </Link>
          <Link
            to="/projects"
            className="flex text-center justify-content-center gap-x-4 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className="size-5">
              <path fill-rule="evenodd" d="M1.75 2a.75.75 0 0 0 0 1.5H2v9h-.25a.75.75 0 0 0 0 1.5h1.5a.75.75 0 0 0 .75-.75v-1.5a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5c0 .414.336.75.75.75h.5a.75.75 0 0 0 .75-.75V3.5h.25a.75.75 0 0 0 0-1.5h-7.5ZM3.5 5.5A.5.5 0 0 1 4 5h.5a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-.5.5H4a.5.5 0 0 1-.5-.5v-.5Zm.5 2a.5.5 0 0 0-.5.5v.5A.5.5 0 0 0 4 9h.5a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5H4Zm2-2a.5.5 0 0 1 .5-.5H7a.5.5 0 0 1 .5.5V6a.5.5 0 0 1-.5.5h-.5A.5.5 0 0 1 6 6v-.5Zm.5 2A.5.5 0 0 0 6 8v.5a.5.5 0 0 0 .5.5H7a.5.5 0 0 0 .5-.5V8a.5.5 0 0 0-.5-.5h-.5ZM11.5 6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2.75a.75.75 0 0 0 0-1.5H14v-5h.25a.75.75 0 0 0 0-1.5H11.5Zm.5 1.5h.5a.5.5 0 0 1 .5.5v.5a.5.5 0 0 1-.5.5H12a.5.5 0 0 1-.5-.5V8a.5.5 0 0 1 .5-.5Zm0 2.5a.5.5 0 0 0-.5.5v.5a.5.5 0 0 0 .5.5h.5a.5.5 0 0 0 .5-.5v-.5a.5.5 0 0 0-.5-.5H12Z" clip-rule="evenodd" />
            </svg>

            <span>Projects</span>
          </Link>
          <Link
            to="/vendors"
            className="flex text-center justify-content-center gap-x-4  px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hard-hat-icon lucide-hard-hat"><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="4" rx="1"/></svg>
            <span>Vendors</span>
            
          </Link>
          <Link
            to="/ai"
            className="flex text-center justify-content-center gap-x-4 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-slack-icon lucide-slack"><rect width="3" height="8" x="13" y="2" rx="1.5"/><path d="M19 8.5V10h1.5A1.5 1.5 0 1 0 19 8.5"/><rect width="3" height="8" x="8" y="14" rx="1.5"/><path d="M5 15.5V14H3.5A1.5 1.5 0 1 0 5 15.5"/><rect width="8" height="3" x="14" y="13" rx="1.5"/><path d="M15.5 19H14v1.5a1.5 1.5 0 1 0 1.5-1.5"/><rect width="8" height="3" x="2" y="8" rx="1.5"/><path d="M8.5 5H10V3.5A1.5 1.5 0 1 0 8.5 5"/></svg>
            <span>AI Assistant</span>
            
          </Link>
          <Link
            to="/login"
            className="flex text-center justify-content-center gap-x-4 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Login</span>
      
          </Link>
          <Link
            to="/settings"
            className="flex text-center justify-content-center gap-x-4 px-4 py-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-settings-icon lucide-settings"><path d="M9.671 4.136a2.34 2.34 0 0 1 4.659 0 2.34 2.34 0 0 0 3.319 1.915 2.34 2.34 0 0 1 2.33 4.033 2.34 2.34 0 0 0 0 3.831 2.34 2.34 0 0 1-2.33 4.033 2.34 2.34 0 0 0-3.319 1.915 2.34 2.34 0 0 1-4.659 0 2.34 2.34 0 0 0-3.32-1.915 2.34 2.34 0 0 1-2.33-4.033 2.34 2.34 0 0 0 0-3.831A2.34 2.34 0 0 1 6.35 6.051a2.34 2.34 0 0 0 3.319-1.915"/><circle cx="12" cy="12" r="3"/></svg>
            <span>Settings</span>
      
          </Link>
        </nav>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:ml-64">
        {/* Topbar */}
        <header className="flex items-center justify-between h-16 px-4 bg-surface-light dark:bg-surface-dark shadow-md">
          {/* Hamburger (mobile only) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden text-gray-600 dark:text-gray-300"
          >
            ☰
          </button>

          <h1 className="text-xl font-semibold">Dashboard</h1>

          {/* Right side: Dark mode toggle + User */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() =>
                document.documentElement.classList.toggle("dark")
              }
              className="px-2 py-1 rounded bg-gray-200 dark:bg-gray-700"
            >
              🌙
            </button>
            <div className="w-8 h-8 bg-gray-400 rounded-full"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default DashboardLayout
