import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Search, Filter, Star, BarChart3 } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <GraduationCap className="h-12 w-12 text-blue-600" />
        </div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">About CourseSearch</h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          A comprehensive course search platform that helps students find the perfect classes with detailed instructor
          ratings and availability information.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-blue-600" />
              Smart Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Search courses by course code, name, or instructor. Our intelligent search helps you find exactly what
              you're looking for quickly and efficiently.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-green-600" />
              Advanced Filtering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Filter courses by availability, instruction mode, credits, GPA requirements, subject areas, and more. Find
              courses that fit your exact needs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              Instructor Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              View Rate My Professor ratings for instructors and sections, including average ratings, difficulty levels,
              and student feedback.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-purple-600" />
              Real-time Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600">
              Get up-to-date information on course availability, enrollment numbers, waitlist status, and seat
              availability.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Available Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Basic Filters</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Course status (Open/Closed/Waitlist)</div>
                <div>• Instruction mode</div>
                <div>• Available seats</div>
                <div>• Results limit</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Course Details</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Credit range</div>
                <div>• Course level</div>
                <div>• Subject areas</div>
                <div>• GPA requirements</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Rate My Professor</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div>• Section rating</div>
                <div>• Difficulty level</div>
                <div>• Number of ratings</div>
                <div>• Would take again %</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Subject Areas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {[
              "Ethnic Studies",
              "Social Science",
              "Humanities",
              "Biological Science",
              "Physical Science",
              "Natural Science",
              "Literature",
            ].map((subject) => (
              <Badge key={subject} variant="outline">
                {subject}
              </Badge>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-4">
            Filter courses by specific subject area requirements to find classes that fulfill your degree requirements.
          </p>
        </CardContent>
      </Card>

      <div className="text-center mt-12 p-6 bg-blue-50 rounded-lg">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Ready to find your perfect courses?</h3>
        <p className="text-blue-700 mb-4">
          Start searching with our comprehensive course database and filtering system.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          Start Searching
        </a>
      </div>
    </div>
  )
}
