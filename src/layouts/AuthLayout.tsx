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
      <div className="grid grid-cols-1 md:grid-cols-2  min-h-screen  bg-background-light dark:bg-background-dark p-1">
        <div className="p-6">
          <h1 className="text-2xl md:text-4xl font-extrabold text-brand-light dark:text-brand-dark mb-4">ConstructHub... Your Construction Companion</h1>
          <p className="text-gray-900 dark:text-gray-100 mb-6 md:text-xl">
            Get started now, sign up below to get accurate cost estimates, verified technicians and trusted vendors around you as a builder.
            
          </p>
          
          <p className="text-gray-900 dark:text-gray-100 mb-6 md:text-xl">
            Already have an account log in view your estimates and the technicians and vendors near you.
          </p>

          {/* Buttons */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setActiveModal("login")}
              className="px-6 py-2 border border-blue-600 bg-brand-light dark:bg-background-dark text-white rounded-lg shadow hover:bg-blue-700 dark:hover:bg-blue-900 transition"
            >
              Login
            </button>
            <button
              onClick={() => setActiveModal("signup")}
              className="px-6 py-2 border border-blue-600 text-white bg-brand-light dark:bg-background-dark rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 transition"
            >
              Sign Up
            </button>
          </div>

          {/* Description */}
          <div className="max-w-xl text-gray-900 dark:text-gray-200 text-lg md:text-xl leading-relaxed">
            <p className="mb-4">
              ConstructHub is an all-in-one digital platform designed to revolutionize the construction experience for everyone involved — builders, vendors, technicians, and project owners.
              We simplify construction planning and execution by bringing together cost estimation tools, vendor marketplaces, and trusted professional services in one place.
            </p>
            <p className="py-4 mb-4">
              <span className="font-semibold">For Builders & Project Owners</span>
              <br />
              Instantly estimate project costs with transparent breakdowns.

              Compare real-time prices from multiple vendors.

              Access a network of verified technicians (electricians, plumbers, masons, etc.) to bring your project to life.
            </p>
            <p>{description}</p>
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
        <div className="">
          <img src="src/assets/image_1.jpg" className="aspect-square object-fill"></img>
        </div>
      </div>
    </>
    
  );
};

export default AuthLayout;


