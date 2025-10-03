// import type { ReactNode } from "react"
// import RightAuthLayout from "../components/RightAuth";
// import LeftAuthLayout from "../components/LeftAuth";


// interface AuthLayoutProps {
//   children: ReactNode;
//   description: string;
// }

// const AuthLayout = ({children, description}: AuthLayoutProps) =>{
//   return (
//     <div className="flex min-h-screen bg-background-light dark:bg-background-dark"
//     >
      
//       {/* left side */}
//       <LeftAuthLayout description={description}/>

//       {/* right */}
//       <RightAuthLayout children={children} />
//     </div>
//   )
// }

// export default AuthLayout

import { useState } from "react";
import LoginCard from "../components/LoginCard";
import SignUpCard from "../components/SignUpCard";
import NavBar from "../components/NavBar";

interface AuthLayoutProps {
  description: string;
}

const AuthLayout = ({ description }: AuthLayoutProps) => {
  const [activeModal, setActiveModal] = useState<"login" | "signup" | null>(null);

  return (
    <>
      <NavBar />
      <div className="grid grid-cols-1 md:grid-cols-2  min-h-screen  bg-surface-light dark:bg-surface-dark">
        <div className="px-4 py-4">
          <div className="p-2">

          
            <h1 className="text-xl md:text-4xl font-extrabold text-brand-light dark:text-brand-dark mb-4">ConstructHub... Your Construction Companion</h1>
            <p className="text-gray-900 dark:text-gray-100 mb-6 md:text-xl leading-7">
              Get started now, sign up below to get accurate cost estimates, verified technicians and trusted vendors around you as a builder.
              
            </p>
            
            <p className="text-gray-900 dark:text-gray-100 mb-6 md:text-xl">
              Already have an account log in view your estimates and the technicians and vendors near you.
            </p>

            {/* Buttons */}
            <div className="flex justify-around md:justify-normal space-x-6 md:space-x-20 mb-6">
              <button
                onClick={() => setActiveModal("login")}
                className="px-6 py-2 md:text-lg border border-blue-600 text-white bg-brand-light dark:bg-background-dark rounded-lg hover:bg-blue-700 dark:hover:bg-blue-900 transition"
              >
                Login
              </button>
              <button
                onClick={() => setActiveModal("signup")}
                className="px-6 py-2 md:text-lg border border-blue-600 text-white bg-brand-light dark:bg-background-dark rounded-lg hover:bg-blue-700 dark:hover:bg-blue-900 transition"
              >
                Sign Up
              </button>
            </div>
            {/* Description */}
            <div className=" text-gray-900 dark:text-gray-100 my-6 md:text-xl leading-7">
              <p className="mb-6 ">
                ConstructHub is an all-in-one digital platform designed to revolutionize the construction experience for everyone involved that is builders, vendors, technicians, and project owners.
                We simplify construction planning and execution by bringing together cost estimation tools, vendor marketplaces, and trusted professional services in one place.
              </p>
              <p>{description}</p>
            </div>
          </div>
          

          {/* Modal Overlay */}
          {activeModal && (
            <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center p-4 z-50">
              <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 relative">
                {/* Close Button */}
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>

                {/* Show card */}
                {activeModal === "login" && <LoginCard />}
                {activeModal === "signup" && <SignUpCard />}
              </div>
            </div>
          )}
        </div>
        <div className="h-screen m-0 pt-4 overflow-hidden">
          <img src="src/assets/image_1.jpg" className="inset-0"></img>
        </div>
      </div>
    </>
    
  );
};

export default AuthLayout;


