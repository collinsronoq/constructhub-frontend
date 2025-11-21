// import EstimatorWizard from "../components/Estimator/EstimatorWizard"

// const Estimates = () =>{
//   return (
//     <EstimatorWizard />
//   )
// }

// export default Estimates


import Estimations from "../components/Estimates/Estimates"

const Estimates = () =>{

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
    {
      id: "4",
      projectName: "Residential Villa",
      category: "Residential",
      estimatedCost: "KSh 8.5M",
      dateCreated: "Oct 3, 2025",
      location: "Rafiki",
    },
    {
      id: "5",
      projectName: "Residential Villa",
      category: "Residential",
      estimatedCost: "KSh 8.5M",
      dateCreated: "Oct 3, 2025",
      location: "Rafiki",
    },
    {
      id: "6",
      projectName: "Residential Villa",
      category: "Residential",
      estimatedCost: "KSh 8.5M",
      dateCreated: "Oct 3, 2025",
      location: "Rafiki",
    },
  ]
  return (
    <Estimations estimates={sampleEstimates} />
  )
}

export default Estimates
