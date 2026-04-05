export interface PhaseDescription {
  whatIsDone: string;
  outcome: string;
}

const DEFAULT_DESCRIPTION: PhaseDescription = {
  whatIsDone: "Core construction activities for this phase are costed from model quantities, rates, and assumptions.",
  outcome: "This phase scope is completed and ready for the next construction stage.",
};

const PHASE_DESCRIPTIONS: Record<string, PhaseDescription> = {
  site_survey: {
    whatIsDone: "Site investigation and survey setup including location checks, soil testing options, and topographical survey scope.",
    outcome: "A verified site baseline is available for safe and informed design and construction planning.",
  },
  site_preparation: {
    whatIsDone: "Early enabling works such as clearing, stripping, spoil handling, disposal, access-conditioned earthworks, and compaction.",
    outcome: "The site is cleared and prepared for structural foundation works.",
  },
  site_preparation_and_earthworks: {
    whatIsDone: "Early enabling works such as clearing, stripping, spoil handling, disposal, access-conditioned earthworks, and compaction.",
    outcome: "The site is cleared and prepared for structural foundation works.",
  },
  foundation: {
    whatIsDone: "Structural base construction including trench/foundation works, concrete, reinforcement, formwork, DPM/hardcore/blinding assumptions, and backfilling.",
    outcome: "A stable structural foundation base is delivered, ready for superstructure build-up.",
  },
  superstructure: {
    whatIsDone: "Primary above-foundation shell works including masonry walls, structural concrete members, slab elements, and reinforcement quantities.",
    outcome: "The main building shell is completed to structural stage and ready for roofing/services/finishes progression.",
  },
  roofing: {
    whatIsDone: "Roof system construction including roof geometry-adjusted covering, timber/structural allowances, and flat-roof waterproofing/concrete scope where applicable.",
    outcome: "The building is weather-protected at roof level and ready for internal progression.",
  },
  services_first_fix: {
    whatIsDone: "First-fix service rough-ins including concealed electrical and plumbing routes, conduits, cables, and pipe run allowances.",
    outcome: "Service infrastructure is embedded and positioned for second-fix fixture installation.",
  },
  services: {
    whatIsDone: "Service installation scope including electrical and plumbing works based on room demand and distribution assumptions.",
    outcome: "Core building services are installed and ready for use or commissioning.",
  },
  services_second_fix: {
    whatIsDone: "Second-fix service works including final electrical points and sanitary/plumbing fixtures based on room demand assumptions.",
    outcome: "Usable building service points and fixtures are installed and ready for commissioning.",
  },
  finishes: {
    whatIsDone: "Surface completion works including floor/wall/ceiling finishes, paint systems, plaster/skimming materials, and joinery/cabinet allowances.",
    outcome: "Interior and exterior finishes are substantially complete to occupiable standard.",
  },
  external_works: {
    whatIsDone: "Site-level external scope including hardscape, softscape, boundary works, sewerage systems, and related plant/equipment allowances.",
    outcome: "The external environment and utility interfaces are prepared for practical project handover.",
  },
};

export function getPhaseDescription(phaseId: string): PhaseDescription {
  return PHASE_DESCRIPTIONS[phaseId] ?? DEFAULT_DESCRIPTION;
}
