// src/components/dashboard/Estimations.tsx
const Estimations = () => {
  return (
    <section>
      <h3>Recent Estimations</h3>

      <div>
        {/* Example cards (will be dynamic later) */}
        <div>
          <h4>3-Bedroom Bungalow</h4>
          <p>Total Estimate: Ksh 4,200,000</p>
          <button>View Details</button>
        </div>

        <div>
          <h4>2-Bedroom House</h4>
          <p>Total Estimate: Ksh 2,850,000</p>
          <button>View Details</button>
        </div>
      </div>

      <button>Create New Estimate</button>
    </section>
  );
};

export default Estimations;
