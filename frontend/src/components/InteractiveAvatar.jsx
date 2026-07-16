import { useEffect, useState } from "react";
import { Frown, Angry, Hand, Laugh, AlertCircle, Meh, Sparkles } from "lucide-react";

export default function InteractiveAvatar({ src, action, emotion, isLatest }) {
  const [animClass, setAnimClass] = useState("animate-none");
  const [showIcon, setShowIcon] = useState(false);

  useEffect(() => {
    if (action && action !== "idle") {
      setShowIcon(true);
      
      let baseTheme = "ring-1 ring-slate-700";
      switch(emotion) {
        case "happy": baseTheme = "ring-2 ring-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.3)]"; break;
        case "joy": baseTheme = "ring-2 ring-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.3)]"; break;
        case "angry": baseTheme = "ring-2 ring-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)] opacity-90"; break;
        case "sad": baseTheme = "ring-2 ring-gray-500 grayscale brightness-75"; break;
        case "surprised": baseTheme = "ring-2 ring-purple-500"; break;
      }
      
      if (isLatest) {
        switch (action) {
          case "wave":
            setAnimClass(`animate-bounce ${baseTheme} scale-110`);
            break;
          case "laugh":
            setAnimClass(`animate-pulse ${baseTheme} rotate-6 scale-110`);
            break;
          case "shake_head":
            setAnimClass(`animate-bounce ${baseTheme} -rotate-12 scale-90`);
            break;
          case "look_down":
            setAnimClass(`animate-pulse ${baseTheme} translate-y-2 opacity-50`);
            break;
          case "jump":
            setAnimClass(`animate-bounce ${baseTheme} scale-125`);
            break;
          default:
            setAnimClass(baseTheme);
        }

        const timer = setTimeout(() => {
          setAnimClass(baseTheme);
        }, 3500);
        
        return () => clearTimeout(timer);
      } else {
        setAnimClass(baseTheme);
      }
    }
  }, [action, emotion, isLatest]);

  const renderFloatingIcon = () => {
    if (!showIcon) return null;
    
    let IconComponent = Sparkles;
    let iconColors = "text-cyan-400 bg-slate-900";
    
    switch(emotion) {
      case "happy": IconComponent = Hand; iconColors = "text-cyan-400 bg-slate-800"; break;
      case "joy": IconComponent = Laugh; iconColors = "text-yellow-400 bg-slate-800"; break;
      case "angry": IconComponent = Angry; iconColors = "text-red-500 bg-slate-800"; break;
      case "sad": IconComponent = Frown; iconColors = "text-gray-400 bg-slate-800"; break;
      case "surprised": IconComponent = AlertCircle; iconColors = "text-purple-400 bg-slate-800"; break;
      default: IconComponent = Meh; iconColors = "text-slate-400 bg-slate-800"; break;
    }

    return (
      <div className={`absolute -top-3 -right-3 p-1.5 rounded-full z-10 border-2 border-slate-900 shadow-xl ${isLatest ? 'animate-bounce' : 'opacity-80 scale-90'} ${iconColors}`}>
        <IconComponent size={16} strokeWidth={2.5} />
      </div>
    );
  };

  return (
    <div className="relative inline-block w-12 h-12 flex-shrink-0 !overflow-visible">
      <img
        src={src || "/avatar.png"}
        onError={(e) => { e.target.src = "/avatar.png" }}
        alt="Avatar"
        className={`w-full h-full rounded-full object-cover transition-all duration-300 ${animClass}`}
      />
      {renderFloatingIcon()}
    </div>
  );
}
