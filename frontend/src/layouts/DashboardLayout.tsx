import { useState } from "react"
import { Outlet } from "react-router-dom"
import NavBar from "../components/Navbar"
import SideBar from "../components/SideBar"
import AIAssistantPanel from "../components/AIAssistantPanel"


const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAIOpen, setAIOpen] = useState(false);
  const [isLogged] = useState(true);

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-gray-100 flex flex-col">
      {/*  NAVBAR — Fixed at top */}
      <div className="fixed top-0 left-0 right-0 z-40 bg-background-light dark:bg-background-dark shadow-md">
        <NavBar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          isLogged={isLogged}
          
        />
      </div>

      {/*  MAIN CONTENT AREA */}
      <div className="flex flex-1 pt-16 relative overflow-hidden">
        {/* SIDEBAR — Fixed on the left */}
        <div className="hidden md:flex fixed top-16 bottom-0 left-0 w-64 bg-surface-light dark:bg-surface-dark border-r border-gray-200 dark:border-gray-700 z-30">
          <SideBar />
        </div>

        {/* SCROLLABLE MAIN CONTENT */}
        <main
          className={`flex-1 overflow-auto p-4  transition-all duration-300 md:ml-64 ${
            isAIOpen ? "md:mr-96" : ""
          }`}
        >
          <Outlet context={{ onToggleOpenAI: ()=> setAIOpen(prev => !prev) }}/>
        </main>

        {/*  AI ASSISTANT PANEL */}
        {isAIOpen && (
          <div className="fixed right-0 top-16 bottom-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-lg z-40">
            <AIAssistantPanel onClose={() => setAIOpen(false)} />
          </div>
        )}
      </div>

      {/* MOBILE SIDEBAR (Drawer) */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden transform ease-in-out">
          {/* backdrop */}
          <div
            className="absolute inset-0 backdrop-blur-sm bg-white/30 transform ease-in-out"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
          {/* drawer */}
          <div className="absolute left-0 top-0 bottom-0 w-64 pr-4">
            <SideBar onLinkClick={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}
      {/* Floating AI Assistant Button */}
      {!isAIOpen && (
        <div className="fixed bottom-36 right-6 z-50">
          <button
            onClick={() => setAIOpen((prev) => !prev)}
            className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 md:p-4 shadow-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300"
            title="Ask ConstructHub AI Assistant"
          >
            
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-bot-icon lucide-bot w-4 h-4 md:w-6 md:h-6 "><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
          </button>
          <span className="hidden md:hidden-none">Ask AI</span>
        </div>
      )}
      

    </div>
  );
};

export default DashboardLayout;

