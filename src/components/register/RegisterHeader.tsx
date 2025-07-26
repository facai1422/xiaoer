
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";

export const RegisterHeader = () => {
  const navigate = useNavigate();
  
  return (
    <div className="bg-white p-4 flex items-center justify-between">
      <button onClick={() => navigate(-1)} className="w-8 h-8 flex items-center justify-center">
        <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>
      <img 
        src="/lovable-uploads/2318c513-2dbd-4abb-b71f-b3e9c4b825d8.png" 
        alt="Logo"
        className="h-8 w-auto"
      />
      <Bell className="w-6 h-6 text-gray-500" />
    </div>
  );
};
