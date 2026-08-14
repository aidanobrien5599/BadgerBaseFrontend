import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export function MaintenanceBanner() {
  return (
    <div className="w-full bg-destructive border-b-4 border-destructive/80 shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <Alert variant="destructive" className="bg-destructive border-destructive text-destructive-foreground">
          <AlertCircle className="h-6 w-6 text-destructive-foreground" />
          <AlertTitle className="text-destructive-foreground text-2xl font-bold mb-2">
            Service Currently Down
          </AlertTitle>
          <AlertDescription className="text-destructive-foreground text-lg">
            We are actively working on fixing the issue. Thank you for your patience and we apologize for any inconvenience.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  )
}
