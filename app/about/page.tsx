import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, Search, Filter, Star, BarChart3 } from "lucide-react"
import Logo from "@/public/BadgerBaseTransparent.png"
import Image from "next/image"

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-4">
          <Image src={Logo} alt="SconnieGrades Logo" width={150} height={150} />
        </div>
        <h1 className="text-4xl font-bold text-foreground mb-4">About BadgerBase</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          A comprehensive data aggregator designed to help UW-Madison students find the best courses to fit their needs. Sourcing data from UW-Madison's live course catalog, Rate My Professor, and Madgrades for an all-in-one course search experience.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-primary" />
              Smart Search
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Search courses by course code, name, or instructor. Our intelligent search helps you find exactly what
              you're looking for quickly and efficiently.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Advanced Filtering
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Filter courses by availability, instruction mode, credits, GPA requirements, subject areas, and more. Find
              courses that fit your exact needs.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-primary" />
              Instructor Ratings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              View Rate My Professor ratings for instructors and sections, including average ratings, difficulty levels,
              and student feedback.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-primary" />
              Real-time Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
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
              <h4 className="font-semibold mb-2">Course Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Course level</div>
                <div>• Breadth</div>
                <div>• Credits</div>
                <div>• Madgrades GPA Info</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Section Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Status (Open/Closed/Waitlist)</div>
                <div>• Available seats</div>
                <div>• Instruction Mode</div>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-2">Professor Details</h4>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div>• Professor rating</div>
                <div>• Difficulty level</div>
                <div>• Number of ratings</div>
                <div>• Would take again %</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      

        <div className="text-center mt-12 p-6 bg-accent rounded-lg">
        <h3 className="text-lg font-semibold text-primary mb-2">Ready to find your perfect courses?</h3>
        <p className="text-primary mb-4">
          Start searching with our comprehensive course database and filtering system.
        </p>
        <a
          href="/"
          className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary-hover transition-colors"
        >
          <Search className="h-4 w-4 mr-2" />
          Start Searching
        </a>
      </div>
    </div>
  )
}
