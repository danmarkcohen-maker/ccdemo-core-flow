import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/")}
      className="absolute top-3 left-3 z-50 w-10 h-10 rounded-full bg-secondary/80 backdrop-blur-md flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors active:scale-90"
    >
      <ArrowLeft size={20} />
    </button>
  );
};

export default BackButton;
