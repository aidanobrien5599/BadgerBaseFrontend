export function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Creator */}
          <div className="flex flex-col items-center text-center space-y-1">
          <p className="text-sm text-gray-600">
            Created by <span className=" hover:underline font-semibold text-red-600"><a href="https://aidanpobrien.com">Aidan O'Brien</a></span>
          </p>
        </div>

          {/* Right side - Disclaimers */}
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-500">
              Not affiliated with UW-Madison • Data from UW-Madison & Madgrades & Rate My Professors
            </p>
            <p className="text-xs text-gray-400 mt-1"> {new Date().getFullYear()} For educational purposes only</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
