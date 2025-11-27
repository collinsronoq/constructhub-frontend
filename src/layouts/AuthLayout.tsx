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
  const isLogged: boolean = false;

  return (
    <>
      <NavBar sidebarOpen={false} setSidebarOpen={() => {}} isLogged={isLogged}/>
      <div className="grid grid-cols-1 md:grid-cols-2  min-h-screen  bg-background-light dark:bg-background-dark">
        <div className="px-4 py-4">
          <div className="p-2 text-justify">

          
            <h1 className="text-xl md:text-4xl font-extrabold text-brand-light dark:text-brand-dark mb-4">ConstructHub... <span className="italic text-sm md:text-2xl">Your Construction Companion</span></h1>
            <p className="text-gray-900 dark:text-gray-100 mb-6 md:text-xl leading-7 ">
              Get started now, sign up below to get accurate cost estimates, verified technicians and trusted vendors around you as a builder.
              
            </p>
            
            <p className="text-gray-900 dark:text-gray-100 mb-6 md:text-xl">
              Already have an account log in view your estimates and the technicians and vendors near you.
            </p>

            {/* Buttons */}
            <div className="flex justify-around md:justify-normal space-x-6 md:space-x-20 mb-6">
              <button
                onClick={() => setActiveModal("login")}
                className="px-6 py-2 md:text-lg border border-blue-600 text-white bg-brand-light dark:bg-background-dark rounded-lg hover:bg-blue-700 dark:hover:bg-blue-900 transition ease-in-out delay-150  hover:-translate-y-1 hover:scale-110  duration-200"
              >
                Login
              </button>
              <button
                onClick={() => setActiveModal("signup")}
                className="px-6 py-2 md:text-lg border border-blue-600 text-white bg-brand-light dark:bg-background-dark rounded-lg hover:bg-blue-700 dark:hover:bg-blue-900 transition ease-in-out delay-150  hover:-translate-y-1 hover:scale-110  duration-200"
              >
                Sign Up
              </button>
            </div>
            {/* Description */}
            <div className=" text-gray-900 dark:text-gray-100 my-6 md:text-xl leading-7 ">
              <p className="mb-6 ">
                ConstructHub is an all-in-one digital platform designed to revolutionize the construction experience for everyone involved that is builders, vendors, technicians, and project owners.
                We simplify construction planning and execution by bringing together cost estimation tools, vendor marketplaces, and trusted professional services in one place.
              </p>
              <p>{description}</p>
            </div>
          </div>
          

          {/* Modal Overlay */}
          {activeModal && (
            <div className="fixed inset-0 bg-surface-light bg-opacity-20  flex items-center justify-center p-4 z-50">
              <div className="bg-surface-light dark:bg-surface-dark  p-4 relative rounded-xl shadow-lg">
                {/* Close Button */}
                <button
                  onClick={() => setActiveModal(null)}
                  className="absolute top-3 right-3 text-gray-800 dark:text-gray-100 dark:hover:text-white hover:text-gray-900"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-x-icon lucide-x"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>

                {/* Show card */}
                {activeModal === "login" && (
                  <LoginCard onSwitch={() => setActiveModal("signup")}/>)}
                {activeModal === "signup" && (
                  <SignUpCard onSwitch={() => setActiveModal("login")}/>)}
              </div>
            </div>
          )}
        </div>
        <div 
          style={{
            backgroundImage: "url('public/image_1.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            height: "100vh",
            width: "100%",
          }}
        >
          {/* <div className="grid grid-cols-1 md:grid-cols-2">
            <div>
              <h1 className="text-xl md:text-4xl font-extrabold text-brand-light dark:text-brand-dark mb-4">ConstructHub... Your Construction Companion</h1>
              <h4 className="text-white text-xl md:text-2xl">Get Started</h4>


            </div>
          </div> */}
          {/* <img src="src/assets/image_1.jpg" className="inset-0"></img> */}
        </div>
      </div>
    </>
    
  );
};

export default AuthLayout;


