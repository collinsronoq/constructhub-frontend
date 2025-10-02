
interface LeftAuthLayoutProps {
  description: string;
}

// const LeftAuthLayout = ({ description }: LeftAuthLayoutProps) => {
//   return (
//     <div className="hidden md:flex w-2/3  text-gray-900 dark:text-gray-100 rounded-2xl p-12">
//       <div className="flex flex-col items-start justify-start w-full max-w-2xl">
//         {/* Title */}
//         <h1 className="text-5xl font-extrabold mb-6">ConstructHub</h1>

//         {/* Detailed Info */}
        
//         <div className="space-y-4 text-lg leading-relaxed">
//           <p>
//             ConstructHub is your all-in-one construction assistant. It helps
//             builders estimate project costs, source high-quality materials, and
//             connect with verified technicians across Kenya.
//           </p>

//           <p>
//             Whether you are a <span className="font-semibold">builder</span>{" "}
//             planning your first home, a{" "}
//             <span className="font-semibold">vendor</span> looking to showcase
//             your materials, or a{" "}
//             <span className="font-semibold">technician</span> aiming to connect
//             with new clients, ConstructHub gives you the tools and visibility
//             you need.
//           </p>

//           <p>
//             Backed by real-time vendor pricing and an AI assistant, ConstructHub
//             makes construction planning transparent, affordable, and reliable.
//           </p>
//           <p>{description}</p>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default LeftAuthLayout;

import { motion } from 'framer-motion';

const LeftAuthLayout = ({ description }: LeftAuthLayoutProps) => {
  return (
    <div 
      className="hidden md:flex w-2/3 text-gray-900 dark:text-gray-100 p-12 rounded-2xl bg-cover bg-center relative"
      
    >
      <div className="absolute inset-0 " />
      <motion.div 
        className="flex flex-col items-start justify-start w-full max-w-2xl relative z-10"
        initial={{ opacity: 0, x: -50 }} 
        animate={{ opacity: 1, x: 0 }} 
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-6xl font-black mb-8 tracking-tight">ConstructHub</h1>
        <div className="space-y-6 text-xl leading-relaxed">
          {/* Add icons or illustrations here, e.g., via SVG components */}
          <p className="italic">
            ConstructHub is your all-in-one construction assistant. It helps
            builders estimate project costs, source high-quality materials, and
            connect with verified technicians across Kenya.
          </p>

          <p className="italic">
            Whether you are a <span className="font-semibold">builder</span>{" "}
            planning your first home, a{" "}
            <span className="font-semibold">vendor</span> looking to showcase
            your materials, or a{" "}
            <span className="font-semibold">technician</span> aiming to connect
            with new clients, ConstructHub gives you the tools and visibility
            you need.
          </p>

          <p className="italic">
            Backed by real-time vendor pricing and an AI assistant, ConstructHub
            makes construction planning transparent, affordable, and reliable.
          </p>
          <p>{description}</p>
          <p className="italic">{description}</p>
        </div>
      </motion.div>
    </div>
  );
};

export default LeftAuthLayout