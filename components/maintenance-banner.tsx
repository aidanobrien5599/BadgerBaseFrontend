import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function MaintenanceBanner() {
  return (
    <div className="w-full bg-red-600 border-b-4 border-red-800 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive" className="bg-red-600 border-red-700 text-white">
          <AlertCircle className="h-6 w-6 text-white" />
          <AlertTitle className="text-white text-2xl font-bold mb-2">
            Service Currently Down
          </AlertTitle>
          <AlertDescription className="text-white text-lg">
            We are actively working on fixing the issue. Thank you for your patience and we apologize for any inconvenience.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
