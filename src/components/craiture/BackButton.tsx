import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate("/")}
      className="absolute top-4 left-4 z-50 w-9 h-9 rounded-full bg-secondary/80 backdrop-blur flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
    >
      <ArrowLeft size={16} />
    </button>
  );
};

export default BackButton;
