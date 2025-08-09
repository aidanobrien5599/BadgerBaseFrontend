import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { TriangleAlert } from "lucide-react"

export function MaintenanceBanner() {
  return (
    <div className="w-full bg-yellow-100 text-yellow-800 p-3 text-center text-sm font-medium">
      <Alert variant="default" className="bg-yellow-50 border-yellow-200 text-yellow-800">
        <TriangleAlert className="h-4 w-4 text-yellow-600" />
        <AlertTitle className="text-yellow-800">Maintenance Alert</AlertTitle>
        <AlertDescription className="text-yellow-700">
          BadgerBase is currently undergoing updates and maintenance. Thank you for your patience!
        </AlertDescription>
      </Alert>
    </div>
  )
}
