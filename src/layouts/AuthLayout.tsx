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

interface AuthLayoutProps {
  description: string;
}

const AuthLayout = ({ description }: AuthLayoutProps) => {
  const [activeModal, setActiveModal] = useState<"login" | "signup" | null>(null);

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-gray-50 p-6">
      {/* Title */}
      <h1 className="text-4xl font-extrabold text-blue-600 mb-6">ConstructHub</h1>

      {/* Buttons */}
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveModal("login")}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition"
        >
          Login
        </button>
        <button
          onClick={() => setActiveModal("signup")}
          className="px-6 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition"
        >
          Sign Up
        </button>
      </div>

      {/* Description */}
      <div className="max-w-xl text-center text-gray-700 text-lg leading-relaxed">
        <p className="mb-4">
          ConstructHub is your all-in-one construction assistant. It helps
          builders estimate project costs, source quality materials, and connect
          with verified technicians across Kenya.
        </p>
        <p>
          Whether you’re a <span className="font-semibold">builder</span>,
          <span className="font-semibold"> vendor</span>, or
          <span className="font-semibold"> technician</span>, ConstructHub
          empowers you with the tools to plan, source, and execute construction
          projects confidently.
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
  );
};

export default AuthLayout;


