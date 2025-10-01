import type { ReactNode } from "react";

interface RightAuthLayoutProps {
  children: ReactNode;
}

const RightAuthLayout = ({children}: RightAuthLayoutProps) =>{
  return (
    <div className="flex w-full md:w-1/2 items-center justify-center p-6">
      {children}
    </div>
  )
  

};

export default RightAuthLayout