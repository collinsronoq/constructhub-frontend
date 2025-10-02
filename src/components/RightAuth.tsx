import type { ReactNode } from "react";

interface RightAuthLayoutProps {
  children: ReactNode;
}

const RightAuthLayout = ({children}: RightAuthLayoutProps) =>{
  return (
    <div className="flex w-full md:w-1/3 items-center justify-center p-8 rounded-3xl m-4 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md shadow-xl">
      {children}
    </div>
  )
  

};

export default RightAuthLayout