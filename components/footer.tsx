export function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 py-8 mt-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Creator Info */}
          <div>
            <h3 className="text-white font-semibold mb-4">Created By</h3>
            <p className="text-sm">
              <strong>Aidan O'Brien</strong>
            </p>
            <p className="text-xs text-gray-400 mt-2">Independent student project</p>
          </div>

          {/* Legal Disclaimers */}
          <div>
            <h3 className="text-white font-semibold mb-4">Legal Disclaimer</h3>
            <div className="text-xs space-y-2">
              <p>
                This application is{" "}
                <strong>not affiliated with, endorsed by, or sponsored by the University of Wisconsin-Madison</strong>.
              </p>
              <p>
                All course and grade data is publicly available information obtained from official university sources
                and third-party educational platforms.
              </p>
              <p>
                Use of this service is at your own discretion. We make no warranties about the accuracy or completeness
                of the information provided.
              </p>
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <h3 className="text-white font-semibold mb-4">Data Sources</h3>
            <div className="text-xs space-y-2">
              <p>
                <strong>Course Information:</strong> UW-Madison Course Guide and Schedule of Classes
              </p>
              <p>
                <strong>Grade Data:</strong> Madison Grades (madgrades.com) - publicly available grade distribution data
              </p>
              <p>
                <strong>Instructor Ratings:</strong> Rate My Professors (ratemyprofessors.com) - publicly available
                instructor reviews
              </p>
              <p className="text-gray-400 mt-3">
                All data is used in accordance with respective terms of service and fair use policies.
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <div className="text-xs text-gray-400">© {new Date().getFullYear()} Sconnie Grades. All rights reserved.</div>
          <div className="text-xs text-gray-400 mt-2 md:mt-0">
            For educational purposes only • Not affiliated with UW-Madison
          </div>
        </div>
      </div>
    </footer>
  )
}
