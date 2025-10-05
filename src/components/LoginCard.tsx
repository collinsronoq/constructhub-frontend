import { useState } from "react";
import PasswordInput from "./PasswordInput";

interface LoginCardProps {
  onLogin?: (data: { email: string; password: string}) => void;
  onSwitch?: () => void;
}

const LoginCard = ({ onLogin, onSwitch }: LoginCardProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  


  const handleSubmit = (e: React.FormEvent) =>{
    e.preventDefault();
    if(onLogin) {
      onLogin({ email, password});
    }
  };

  return (
    <div className="p-4">
      
      <h2 className="text-xl text-center font-bold text-gray-700 dark:text-gray-100 mb-4">Login Form</h2>
      
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="text-gray-900 dark:text-gray-100">
          <label className="block text-sm md:text-lg font-medium">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) =>setEmail(e.target.value) }
            className="mt-1 w-full border text-gray-900 dark:text-gray-100 border-gray-300 bg-surface-light dark:bg-surface-dark rounded-lg p-2 focus:ring-2 focus:ring-blue-500"
            placeholder="example@gmail.com"
          />
        </div>
        <div className="text-gray-900 dark:text-gray-100">
          <label className="block text-sm md:text-lg  font-medium">Password</label>
          <PasswordInput 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="w-full text-sm md:text-lg bg-blue-600 text-white dark:text-gray-100 py-2 rounded-lg hover:bg-blue-700 transition">
          Login
        </button>
      </form>
      <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 mt-4">
        Don’t have an account?{" "}
        <button type="button" className="text-blue-500 hover:underline" onClick={onSwitch}>
          Sign up
        </button>
      </p>
    </div>
  );
};

export default LoginCard
