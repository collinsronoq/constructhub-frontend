import { useState } from "react";
import PasswordInput from "./PasswordInput";

interface LoginCardProps {
  onLogin?: (data: { email: string; password: string}) => void;
}

const LoginCard = ({ onLogin }: LoginCardProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = (e: React.FormEvent) =>{
    e.preventDefault();
    if(onLogin) {
      onLogin({ email, password});
    }
  };

  return (
    <div className="w-full max-w-md bg-gray-50 shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl text-center justify-center font-bold text-gray-800 mb-6">Login Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) =>setEmail(e.target.value) }
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-lgfont-medium">Password</label>
          <PasswordInput 
          value={password}
          onChange={(e) => setPassword(e.target.value)}/>
        </div>
        <button type="submit" className="w-full text-lg bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition">
          Login
        </button>
      </form>
      <p className="text-lg text-gray-600 mt-4">
        Don’t have an account?{" "}
        <a href="/signup" className="text-blue-600 hover:underline">
          Sign up
        </a>
      </p>
    </div>
  );
};

export default LoginCard
