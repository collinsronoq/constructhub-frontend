import type { ReactNode } from "react"
import RightAuthLayout from "../components/RightAuth";
import LeftAuthLayout from "../components/LeftAuth";


interface AuthLayoutProps {
  children: ReactNode;
  description: string;
}

const AuthLayout = ({children, description}: AuthLayoutProps) =>{
  return (
    <div className="flex min-h-screen">
      
      {/* left side */}
      <LeftAuthLayout description={description}/>

      {/* right */}
      <RightAuthLayout children={children} />
    </div>
  )
}

export default AuthLayout

