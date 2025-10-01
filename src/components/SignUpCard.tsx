import { useState } from "react"
import PasswordInput from "./PasswordInput";

interface SignUpCardProps {
  onSignUp?: (data: { username: string; email: string; password: string; role: string}) =>void;
}

const SignUpCard = ({ onSignUp }: SignUpCardProps) =>{
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    role: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>{
    setForm({...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) =>{
    e.preventDefault();
    if(onSignUp){
      onSignUp(form);
    }
  };


  return (
    <div className="w-full max-w-md bg-gray-50 shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl  text-center justify-center font-bold text-gray-800 mb-6">Sign Up Form</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-lg font-medium">Username</label>
          <input
            type="text"
            name="username"
            value={form.username}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-light dark:focus:ring-brand-dark"
            required
            placeholder="enter username"
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Email</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-light dark:focus:ring-brand-dark"
            required
            placeholder="example@gmail.com"
          />

        </div>
        <div>
          <label className="block text-lg font-medium">Password</label>
          <PasswordInput 
            value={form.password}
            onChange={handleChange}
          />
        </div>
        <div>
          <label className="block text-lg font-medium">Role</label>
          <select
            name="role"
            value={form.role}
            onChange={handleChange}
            className="mt-1 w-full border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-brand-light dark:focus:ring-brand-dark"
          >
            <option value="builder">Builder</option>
            <option value="technician">Technician</option>
            <option value="vendor">Vendor</option>

          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
        >
          Sign Up
        </button>
      </form>
      <p className="text-lg text-gray-600 mt-4">
        Already have an account?{" "}
        <a href="/login" className="text-blue-600 hover:underline">
          Login
        </a>
      </p>
    </div>
  );
};

export default SignUpCard