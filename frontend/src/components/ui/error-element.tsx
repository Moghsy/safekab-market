import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ErrorElement({ error }: { error?: unknown }) {
  let message = "An unexpected error occurred.";
  if (error instanceof Error) message = error.message;
  else if (typeof error === "string") message = error;

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center min-h-[60vh] p-8",
        "bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl shadow"
      )}
    >
      <div className="flex items-center gap-3 mb-4">
        <AlertTriangle className="text-red-600 dark:text-red-400 w-8 h-8" />
        <span className="text-xl font-semibold text-red-700 dark:text-red-300">
          Something went wrong
        </span>
      </div>
      <div className="text-red-800 dark:text-red-200 text-base max-w-xl text-center">
        {message}
      </div>
    </div>
  );
}
