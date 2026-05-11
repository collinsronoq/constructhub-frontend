import { useState, useEffect } from "react"


interface NavBarProps{
  sidebarOpen: boolean;
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isLogged: boolean;
  
}

const NavBar = ({ sidebarOpen, setSidebarOpen, isLogged }: NavBarProps) => {
  const [isDark, setIsDark ] = useState<boolean>(false);

  useEffect(() => {
    setIsDark(document.documentElement.classList.toggle("dark"));
  }, []);

  const toggleDarkMode = () =>{
    document.documentElement.classList.toggle("dark");
    setIsDark(!isDark)
  }

  
  return(
    
    <header className="flex items-center justify-between h-16 px-4 bg-surface-light dark:bg-surface-dark shadow-md">
      

      <div className="flex flex-row space-x-2">
        <div className="text-gray-600 dark:text-gray-300">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-shovel-icon lucide-shovel w-4 h-4 md:w-6 md:h-6"><path d="M21.56 4.56a1.5 1.5 0 0 1 0 2.122l-.47.47a3 3 0 0 1-4.212-.03 3 3 0 0 1 0-4.243l.44-.44a1.5 1.5 0 0 1 2.121 0z"/><path d="M3 22a1 1 0 0 1-1-1v-3.586a1 1 0 0 1 .293-.707l3.355-3.355a1.205 1.205 0 0 1 1.704 0l3.296 3.296a1.205 1.205 0 0 1 0 1.704l-3.355 3.355a1 1 0 0 1-.707.293z"/><path d="m9 15 7.879-7.878"/></svg>
        </div>
        <h1 className="text-sm md:text-xl font-semibold text-gray-900 dark:text-brand-dark">CONSTRUCT HUB</h1>
      </div>
      

      {/* Right side: Dark mode toggle + User */}
      <div className="flex items-center space-x-4">
        <button
          onClick={toggleDarkMode}
          className="px-2 py-2 text-gray-600 dark:text-gray-300"
        >
          {!isDark ? (
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-sun-icon lucide-sun  w-4 h-4 md:w-6 md:h-6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/>
              </svg>
            </div>):
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-moon-icon lucide-moon w-4 h-4 md:w-6 md:h-6"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>
            </div>
          }
        </button>
        {/* <button
          onClick={onToggleAI}
          className="flex items-center gap-2 px-4 py-2 rounded-md text-gray-700 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-message-circle"
          >
            <path d="M21 11.5a8.38 8.38 0 0 1-1.9 5.4 8.5 8.5 0 0 1-6.6 3.1 8.38 8.38 0 0 1-5.4-1.9L3 21l2.3-4.1a8.38 8.38 0 0 1-1.9-5.4 8.5 8.5 0 0 1 3.1-6.6 8.38 8.38 0 0 1 5.4-1.9h.5a8.5 8.5 0 0 1 8.5 8.5z" />
          </svg>
          <span className="hidden sm:inline">AI Assistant</span>
        </button> */}

        {isLogged && (
          <button 
          // add a funnction which is going to trigger the profile page
          className="px-2 py-2 text-gray-600 dark:text-gray-300  items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5"    stroke="currentColor" className="w-4 h-4 md:w-6 md:h-6">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
          </svg>

        </button>
        )}
        
        {/* Hamburger (mobile only) */}
        {/* wafaa kuona kama mtumiaji anaruhusa ndiposa haweze kuona hili */}
        {isLogged && (
          <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="md:hidden text-gray-600 dark:text-gray-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" className="size-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>

            {/* ☰ */}
          </button>

        )}
        
      </div>
    </header>
  )
}

export default NavBar