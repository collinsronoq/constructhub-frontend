import { useNavigate } from "react-router-dom";


interface WelcomeSectionProps {
  builderName?: string;
  onOpenChat?: () => void;
}


const WelcomeSection = ({ builderName = "Collins", onOpenChat }: WelcomeSectionProps) => {

  const navigate = useNavigate();  
  // Navigation handlers:
  const goToEstimation = () => navigate("/estimate"); 
  const goToVendors = () => navigate("/vendors");
  const goToTechnicians = () => navigate("/technicians");

  
  return (
    <section className="bg-surface-light dark:bg-surface-dark rounded-2xl shadow-md p-6 md:p-8 mb-8">
      {/* Greeting and intro */}
      <div className="mb-6">
        <div className="inline-flex gap-x-2 md:gap-x-4 justify-items-center">
          
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-hard-hat-icon lucide-hard-hat w-5 h-5 md:w-5 md:h-5"><path d="M10 10V5a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v5"/><path d="M14 6a6 6 0 0 1 6 6v3"/><path d="M4 15v-3a6 6 0 0 1 6-6"/><rect x="2" y="15" width="20" height="4" rx="1"/></svg>
          <h2 className="text-2xl font-semibold text-blue-600">
            Welcome back, {builderName}
          </h2>
        </div>
        {/* 👷 */}
        <p className="text-gray-700 dark:text-gray-300 mt-2 text-sm md:text-base">
          Ready to plan your next construction project? Start with an estimate,
          consult the AI assistant, or explore verified vendors and technicians.
        </p>
      </div>

      {/* Quick action buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
        <button onClick={goToEstimation} className="bg-blue-600 hover:bg-blue-700  text-white font-medium py-3 px-4 rounded-lg transition">
          Start Estimation
        </button>
        {/* bg-gradient-to-r from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800 text-white font-medium py-3 px-4 rounded-lg transition */}
        <button onClick={onOpenChat} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition">
          Ask AI Assistant
        </button>

        <button onClick={goToVendors} className="bg-white border border-blue-600 text-blue-600  hover:bg-blue-100 font-medium py-3 px-4 rounded-lg transition">
          Find Vendors
        </button>

        <button onClick={goToTechnicians} className="bg-white border border-blue-600 text-blue-600 hover:bg-blue-100 font-medium py-3 px-4 rounded-lg transition">
          Hire Technicians
        </button>
      </div>
    </section>
  );
};

export default WelcomeSection;
