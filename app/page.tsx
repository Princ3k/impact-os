"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, CheckCircle2, Sparkles, History } from "lucide-react"
import { Capybara } from "@/components/capybara"
import { useAuth } from "@/lib/auth-context"
import { Feature } from "@/components/ui/feature-section-with-bento-grid"

export default function LandingPage() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-8 w-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    )
  }

  if (user) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-40 h-40 bg-accent/20 rounded-full blur-3xl" />
        </div>

        <div className="relative w-full max-w-md space-y-8 text-center">
          <div className="flex flex-col items-center">
            <div className="inline-flex items-center justify-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full text-primary text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Track your wins
            </div>
            <Capybara mood="happy" size={80} />
            <h1 className="text-2xl font-bold tracking-tight mt-4">Impact OS</h1>
            <p className="text-muted-foreground mt-2">Your work matters. Let's prove it.</p>
          </div>

          <div className="flex flex-col gap-4">
            <Link href="/log" className="group">
              <div className="p-6 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-primary/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <CheckCircle2 className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="font-semibold text-foreground">Log today's work</h2>
                    <p className="text-sm text-muted-foreground">Capture what you accomplished</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>

            <Link href="/report" className="group">
              <div className="p-6 bg-card rounded-2xl shadow-sm border border-border hover:shadow-md hover:border-accent/30 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-accent/20 rounded-xl flex items-center justify-center group-hover:bg-accent/30 transition-colors">
                    <Sparkles className="h-5 w-5 text-accent-foreground" />
                  </div>
                  <div className="flex-1 text-left">
                    <h2 className="font-semibold text-foreground">Generate report</h2>
                    <p className="text-sm text-muted-foreground">Summarize your achievements</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-accent-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </Link>
          </div>

          <nav className="pt-6">
            <Link
              href="/timeline"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              View past entries
              <ArrowRight className="h-4 w-4" />
            </Link>
          </nav>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen flex flex-col">
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-16 text-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-2xl mx-auto space-y-8">
          <div className="flex justify-center">
            <Capybara mood="excited" size={120} />
          </div>
          
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight text-foreground">
              Track your work. <br />
              <span className="text-primary">Get recognized.</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
              Impact OS helps you log your daily wins and uses AI to generate professional weekly reports and 1:1 summaries.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="h-14 px-8 text-lg rounded-full shadow-lg hover:shadow-xl transition-all">
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <Feature />

      <footer className="py-8 text-center text-sm text-muted-foreground border-t border-border">
        <p>© {new Date().getFullYear()} Impact OS. Built for engineers.</p>
      </footer>
    </main>
  )
}