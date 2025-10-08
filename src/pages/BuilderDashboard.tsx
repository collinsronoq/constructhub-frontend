import WelcomeSection from "../components/BuilderDashboard/WelcomeSection";
import Estimations from "../components/BuilderDashboard/Estimations";
import AIAssistantWidget from "../components/BuilderDashboard/AIAssistantWidget";
import Recommendations from "../components/BuilderDashboard/Recommendations";
import LearningTips from "../components/BuilderDashboard/LearningTips";


const BuilderDashboard = () => {
  const sampleEstimates = [
    {
      id: "1",
      projectName: "Residential Villa",
      category: "Residential",
      estimatedCost: "KSh 8.5M",
      dateCreated: "Oct 3, 2025",
      location: "Rafiki",
    },
    {
      id: "2",
      projectName: "Office Complex",
      category: "Commercial",
      estimatedCost: "KSh 14.2M",
      dateCreated: "Oct 1, 2025",
      location: "Syokimau",
    },
    {
      id: "3",
      projectName: "Renovation Project",
      category: "Residential",
      estimatedCost: "KSh 2.3M",
      dateCreated: "Sep 28, 2025",
      location: "Rafiki",
    },
  ]
  return (
    <div>
      {/* Welcome & Quick Actions */}
      <WelcomeSection />

      {/* Estimation Summary */}
      <Estimations estimates={sampleEstimates} />

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
  