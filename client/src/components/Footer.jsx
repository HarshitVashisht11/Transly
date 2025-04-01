import { Link } from "react-router-dom";
import { useHealthCheck } from "@/hooks/use-health-check";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export default function Footer() {
  const healthStatus = useHealthCheck();

  return (
    <footer className="border-t border-gray-100 py-8 mt-24">
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <Link to="/" className="text-xl font-bold text-transly-800">
              Transly
            </Link>
            <p className="text-sm text-gray-500 mt-1">
              Powered by OpenAI's Whisper
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
