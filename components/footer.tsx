export function Footer() {
  return (
    <footer className="bg-background border-t border-border py-6">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          {/* Left side - Creator */}
          <div className="flex flex-col items-center text-center space-y-1">
          <p className="font-mono text-[13px] text-muted-foreground">
            Created by <span className=" hover:underline font-semibold text-primary"><a href="https://aidanpobrien.com">Aidan O'Brien</a></span> and <span className=" hover:underline font-semibold text-primary"><a href="https://navkumarr.github.io/navportfolio/">Nav Kumar</a></span>
          </p>
        </div>

          {/* Right side - Disclaimers */}
          <div className="text-center md:text-right">
            <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground font-medium">
              Last updated for Fall 2026
            </p>
            <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground mt-1">
              Not affiliated with UW-Madison • Data from UW-Madison & Madgrades & Rate My Professors
            </p>
            <p className="font-mono text-[11px] tracking-[0.06em] text-muted-foreground/60 mt-1">
              {new Date().getFullYear()} For educational purposes only
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
