import WelcomeSection from "../components/BuilderDashboard/WelcomeSection";
import EstimationSummary from "../components/BuilderDashboard/Estimations";
import AIAssistantWidget from "../components/BuilderDashboard/AIAssistantWidget";
import Recommendations from "../components/BuilderDashboard/Recommendations";
import LearningTips from "../components/BuilderDashboard/LearningTips";


const BuilderDashboard = () => {
  return (
    <div>
      {/* Welcome & Quick Actions */}
      <WelcomeSection />

      {/* Estimation Summary */}
      <EstimationSummary />

      {/* AI Assistant Overview */}
      <AIAssistantWidget />

      {/* Recommended Vendors & Technicians */}
      <Recommendations />

      {/* Learning & Tips Section (Optional) */}
      <LearningTips />
    </div>
  );
};

export default BuilderDashboard;
  