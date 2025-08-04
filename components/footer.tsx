export function Footer() {
  return (
    <footer className="bg-white border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-600">
            Created by <span className="text-red-600 font-medium">Aidan O'Brien</span> • Not affiliated with UW-Madison
            • Data from UW Course Guide, Madison Grades, and Rate My Professors
          </div>
          <div className="text-xs text-gray-500">© 2024 Independent student project</div>
        </div>
      </div>
    </footer>
  )
}
