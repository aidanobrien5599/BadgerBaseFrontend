export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Creator */}
          <div className="text-center md:text-left">
            <p className="text-sm text-gray-600">
              Created by <span className="font-semibold text-red-600">Aidan O'Brien</span>
            </p>
          </div>

          {/* Right side - Disclaimers */}
          <div className="text-center md:text-right">
            <p className="text-xs text-gray-500">
              Not affiliated with UW-Madison • Data from Madison Grades & Rate My Professors
            </p>
            <p className="text-xs text-gray-400 mt-1">© {new Date().getFullYear()} For educational purposes only</p>
          </div>
        </div>
      </div>
    </footer>
  )
}
