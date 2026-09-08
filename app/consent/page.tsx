import { Suspense } from "react"
import { ConsentForm } from "./consent-form"

// The consent screen is the one page a student reads before granting an AI
// client access to their account. `ConsentForm` reads `client_id` and
// `scope` off the query string via `useSearchParams()`, which Next 15
// requires to sit behind a Suspense boundary -- without this wrapper
// `npm run build` fails with "useSearchParams() should be wrapped in a
// suspense boundary" even though the component renders fine under vitest.
function ConsentFallback() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <p className="text-sm text-muted-foreground">Loading…</p>
    </div>
  )
}

export default function ConsentPage() {
  return (
    <Suspense fallback={<ConsentFallback />}>
      <ConsentForm />
    </Suspense>
  )
}
