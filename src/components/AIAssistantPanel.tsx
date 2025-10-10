import { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "ai";
  text: string;
}

interface AIAssistantPanelProps {
  onClose: () => void;
}

const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "ai",
      text: "Hi there 👋, I'm your Construct Hub Assistant! How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const newMessage: Message = { sender: "user", text: input };
    setMessages((prev) => [...prev, newMessage]);

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "That's a great question! Let me help you with that...",
        },
      ]);
    }, 800);

    setInput("");
  };

  return (
    <div className="fixed right-0 top-16 bottom-0 w-full md:w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 shadow-xl flex flex-col z-50">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-gray-100">
          ConstructHub AI Assistant
        </h2>
        <button
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="lucide lucide-x-icon lucide-x w-4 h-4 md:w-5 md:h-5"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
        </button>
      </div>

      {/* Chat Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex ${
              msg.sender === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`px-4 py-2 rounded-lg max-w-[75%] text-sm ${
                msg.sender === "user"
                  ? "bg-blue-600 text-white rounded-br-none"
                  : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={chatEndRef} />
      </div>

      {/* Input Section */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask something about your project..."
          className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
        />
        <button
          onClick={handleSend}
          className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M4.5 12h15m0 0l-6-6m6 6l-6 6"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default AIAssistantPanel;


// import { useState, useRef, useEffect } from "react"

// interface Message {
//   sender: "user" | "ai"
//   text: string
// }

// interface AIAssistantPanelProps {
//   onClose: () => void
// }

// const AIAssistantPanel: React.FC<AIAssistantPanelProps> = ({ onClose }) => {
//   const [messages, setMessages] = useState<Message[]>([
//     { sender: "ai", text: "Hi there 👋, I'm your Construct Hub Assistant! How can I help you today?" },
//   ])
//   const [input, setInput] = useState("")
//   const [isVisible, setIsVisible] = useState(false)
//   const chatEndRef = useRef<HTMLDivElement | null>(null)

//   useEffect(() => {
//     chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
//   }, [messages])

//   // Trigger animation on mount
//   useEffect(() => {
//     setIsVisible(true)
//   }, [])

//   const handleSend = () => {
//     if (!input.trim()) return
//     const newMessage: Message = { sender: "user", text: input }
//     setMessages((prev) => [...prev, newMessage])

//     setTimeout(() => {
//       setMessages((prev) => [
//         ...prev,
//         { sender: "ai", text: "That's a great question! Let me help you with that..." },
//       ])
//     }, 800)

//     setInput("")
//   }

//   return (
//     <div
//       className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm md:backdrop-blur-0 md:bg-transparent"
//       onClick={onClose}
//     >
//       {/* Panel container */}
//       <div
//         onClick={(e) => e.stopPropagation()}
//         className={`transform transition-transform duration-300 ease-in-out
//           bg-white dark:bg-gray-900 shadow-xl border-l border-gray-200 dark:border-gray-700
//           w-full max-w-md md:max-w-lg h-full md:h-[90vh] md:mt-8 md:mr-6 md:rounded-xl flex flex-col
//           ${isVisible ? "translate-x-0" : "translate-x-full"}
//         `}
//       >
//         {/* Header */}
//         <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
//           <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
//             ConstructHub AI Assistant
//           </h2>
//           <button
//             onClick={() => {
//               setIsVisible(false)
//               setTimeout(onClose, 300) // wait for animation to finish
//             }}
//             className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
//           >
//             ✕
//           </button>
//         </div>

//         {/* Chat Body */}
//         <div className="flex-1 overflow-y-auto p-4 space-y-4">
//           {messages.map((msg, index) => (
//             <div
//               key={index}
//               className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
//             >
//               <div
//                 className={`px-4 py-2 rounded-lg max-w-[75%] text-sm ${
//                   msg.sender === "user"
//                     ? "bg-blue-600 text-white rounded-br-none"
//                     : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"
//                 }`}
//               >
//                 {msg.text}
//               </div>
//             </div>
//           ))}
//           <div ref={chatEndRef} />
//         </div>

//         {/* Input Section */}
//         <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex items-center gap-2">
//           <input
//             type="text"
//             value={input}
//             onChange={(e) => setInput(e.target.value)}
//             placeholder="Ask something about your project..."
//             className="flex-1 px-4 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600
//               focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 dark:bg-gray-800
//               text-gray-900 dark:text-gray-100"
//           />
//           <button
//             onClick={handleSend}
//             className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
//           >
//             <svg
//               xmlns="http://www.w3.org/2000/svg"
//               fill="none"
//               viewBox="0 0 24 24"
//               strokeWidth={2}
//               stroke="currentColor"
//               className="w-5 h-5"
//             >
//               <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12h15m0 0l-6-6m6 6l-6 6" />
//             </svg>
//           </button>
//         </div>
//       </div>
//     </div>
//   )
// }

// export default AIAssistantPanel