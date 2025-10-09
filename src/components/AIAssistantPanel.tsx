import { useState, useRef, useEffect } from "react";

interface Message {
  sender: "user" | "ai"
  text: string
}

interface AIChatModalProps {
  onClose: () => void
}

const AIChatModal: React.FC<AIChatModalProps> = ({ onClose }) =>{

  const [messages, setMessages] = useState<Message[]>([{ sender: "ai", text: "Hi there 👋, I'm your Construct Hub Assistant! How can I help you today?"}])
  const [input, setInput] = useState("")
  const chatEndRef = useRef<HTMLDivElement | null>(null)

  useEffect (() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth"})
  }, [messages])


  const handleSend = () => {
    if (!input.trim()) return

    const newMessage: Message = { sender: "user", text: input }
    setMessages((prev) => [...prev, newMessage])

    setTimeout(() => {
      setMessages((prev) => [
        ...prev, { sender: "ai", text: "That's a great question! Let me help you with that..."},
      ])
    }, 800)

    setInput("")
  }

  if(!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white dark:bg-gray-900 rounded-xl shadow-xl w-full max-w-lg h-[80vh] flex flex-col relative">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ConstructHub AI Assistant
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            ✕
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
    </div>
  )




}

export default AIChatModal