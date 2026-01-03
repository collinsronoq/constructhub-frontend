import { useOutletContext } from "react-router-dom";
import WelcomeSection from "../components/BuilderDashboard/WelcomeSection";
import RecentEstimations from "../components/BuilderDashboard/RecentEstimations";
import AIAssistantWidget from "../components/BuilderDashboard/AIAssistantWidget";
// import AIAssistantPanel from "../components/AIAssistantPanel";
import Recommendations from "../components/BuilderDashboard/Recommendations";
import LearningTips from "../components/BuilderDashboard/LearningTips";
import { useEstimations } from "../hooks/Estimator/useEstimations";
import { useRecommendations } from "../hooks/useRecommendations";
import { useArticles } from "../hooks/Articles/useArticles";



const BuilderDashboard = () => {
  const { estimates, loading: estLoading, error: estError } = useEstimations();
  const { vendors, technicians, loading: recLoading, error: recError } = useRecommendations();
  const { featuredArticles } = useArticles();

  const { onToggleOpenAI } = useOutletContext<{ onToggleOpenAI: () => void }>();

  const mappedEstimates = estimates.map((e) => ({
    id: String(e.id),
    projectName: (e as any).project_title || e.project_name || "Project",
    category: "Residential",
    estimatedCost: `KSh ${Number((e as any).total_cost || 0).toLocaleString()}`,
    dateCreated: e.created_at ? new Date(e.created_at).toLocaleDateString() : "",
    location: (e as any).location || "N/A",
  }));
  
  return (
    <div>
      {/* Welcome & Quick Actions */}
      <WelcomeSection onOpenChat={ onToggleOpenAI } />

      {/* Estimation Summary */}
      <RecentEstimations estimates={mappedEstimates.slice(0,3)} loading={estLoading} error={estError} />

      {/* AI Assistant Overview */}
      <AIAssistantWidget onOpenChat={ onToggleOpenAI } />

      
      {/* Recommended Vendors & Technicians */}
      <Recommendations vendors={vendors} technicians={technicians} loading={recLoading} error={recError} />

      {/* Learning & Tips Section (Optional) */}
      <LearningTips articles={featuredArticles} />
    </div>
  );
};

export default BuilderDashboard;
  
