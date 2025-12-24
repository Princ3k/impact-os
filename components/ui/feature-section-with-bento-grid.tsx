import { Sparkles, Zap, Shield, TrendingUp } from "lucide-react";
import { Badge } from "@/components/ui/badge";

function Feature() {
  return (
    <div className="w-full py-12 md:py-20 lg:py-40 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col gap-8 md:gap-10">
          {/* Header Section */}
          <div className="flex gap-4 flex-col items-start">
            <div>
              <Badge>Platform</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-3xl md:text-4xl lg:text-5xl tracking-tighter max-w-xl font-regular text-left">
                Don't let your work go invisible.
              </h2>
              <p className="text-base md:text-lg max-w-xl lg:max-w-lg leading-relaxed tracking-tight text-muted-foreground text-left">
                Track your daily wins, generate professional reports, and make your impact visible to those who matter.
              </p>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {/* AI-Powered Reports - Large Card */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background rounded-2xl h-full lg:col-span-2 p-6 md:p-8 min-h-[280px] sm:min-h-[320px] flex justify-between flex-col border border-primary/10 hover:border-primary/20 transition-all group">
              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                <Sparkles className="w-7 h-7 md:w-8 md:h-8 stroke-1 text-primary" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl md:text-2xl tracking-tight font-semibold">AI-Powered Reports</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Transform your daily logs into professional weekly summaries and 1:1 prep docs instantly with AI.
                </p>
              </div>
            </div>

            {/* Quick Logging */}
            <div className="bg-gradient-to-br from-accent/20 via-accent/10 to-background rounded-2xl min-h-[280px] sm:min-h-[320px] p-6 md:p-8 flex justify-between flex-col border border-accent/10 hover:border-accent/20 transition-all group">
              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-accent/20 group-hover:bg-accent/30 transition-colors">
                <Zap className="w-7 h-7 md:w-8 md:h-8 stroke-1 text-accent-foreground" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl md:text-2xl tracking-tight font-semibold">Quick Logging</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Capture your accomplishments in seconds. Don't rely on memory at the end of the week.
                </p>
              </div>
            </div>

            {/* Secure & Private */}
            <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-background rounded-2xl min-h-[280px] sm:min-h-[320px] p-6 md:p-8 flex justify-between flex-col border border-green-500/10 hover:border-green-500/20 transition-all group">
              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-green-500/10 group-hover:bg-green-500/20 transition-colors">
                <Shield className="w-7 h-7 md:w-8 md:h-8 stroke-1 text-green-600 dark:text-green-400" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl md:text-2xl tracking-tight font-semibold">Secure & Private</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Your data is encrypted and secure. Built with enterprise-grade security standards.
                </p>
              </div>
            </div>

            {/* Career Timeline - Large Card */}
            <div className="bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-background rounded-2xl h-full lg:col-span-2 p-6 md:p-8 min-h-[280px] sm:min-h-[320px] flex justify-between flex-col border border-blue-500/10 hover:border-blue-500/20 transition-all group">
              <div className="flex items-center justify-center w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
                <TrendingUp className="w-7 h-7 md:w-8 md:h-8 stroke-1 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col gap-2">
                <h3 className="text-xl md:text-2xl tracking-tight font-semibold">Career Timeline</h3>
                <p className="text-muted-foreground text-sm md:text-base leading-relaxed">
                  Build a permanent record of your accomplishments and track your professional growth over time.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Feature };
