import { Capybara } from "./capybara"

interface LogoProps {
  size?: "sm" | "md" | "lg"
  showTagline?: boolean
  className?: string
}

export function Logo({ size = "md", showTagline = false, className = "" }: LogoProps) {
  const sizes = {
    sm: { capy: 32, text: "text-lg", tagline: "text-xs" },
    md: { capy: 40, text: "text-2xl", tagline: "text-sm" },
    lg: { capy: 48, text: "text-3xl", tagline: "text-base" },
  }

  const { capy, text, tagline } = sizes[size]

  return (
    <div className={`flex flex-col items-center ${className}`}>
      <div className="flex flex-col items-center">
        <div className="-mb-2">
          <Capybara mood="happy" size={capy} />
        </div>
        <h1 className={`${text} font-bold tracking-tight text-foreground`}>Impact OS</h1>
      </div>

      {showTagline && <p className={`${tagline} text-muted-foreground mt-2`}>Your work matters. Let's prove it.</p>}
    </div>
  )
}
