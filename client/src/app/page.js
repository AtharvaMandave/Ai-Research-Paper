"use client";

import Link from 'next/link';
import {
  Wand2,
  FileText,
  Edit3,
  Shield,
  BookOpen,
  ArrowRight,
  Bot,
  CheckCircle2,
  Download,
  Users
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col justify-center py-24 md:py-32 px-4 sm:px-6 lg:px-8 bg-[hsl(var(--background))]">
        <div className="container-width max-w-5xl mx-auto text-center">

          {/* Badge */}
          <div className="inline-flex items-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3 py-1 text-sm font-medium text-[hsl(var(--secondary-foreground))] mb-8 animate-in" style={{ animationDelay: '0s' }}>
            <span className="flex h-2 w-2 rounded-full bg-green-500 mr-2"></span>
            v1.0 Public Beta
          </div>

          {/* Headline */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-[hsl(var(--foreground))] mb-6 animate-in" style={{ animationDelay: '0.1s' }}>
            Research papers, <br className="hidden sm:block" />
            <span className="text-[hsl(var(--muted-foreground))]">simplified with AI.</span>
          </h1>

          {/* Subheadline */}
          <p className="text-lg md:text-xl text-[hsl(var(--muted-foreground))] max-w-2xl mx-auto mb-10 leading-relaxed animate-in" style={{ animationDelay: '0.2s' }}>
            The all-in-one platform for researchers. Generate drafts, format to IEEE standards, and collaborate with intelligent writing assistance.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in" style={{ animationDelay: '0.3s' }}>
            <Link href="/generate" className="btn-primary h-12 px-8 rounded-full text-base w-full sm:w-auto">
              Start Generating
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link href="/editor" className="btn-outline h-12 px-8 rounded-full text-base w-full sm:w-auto">
              Open Editor
            </Link>
          </div>

          {/* Social Proof / Trust */}
          <div className="mt-12 pt-8 border-t border-[hsl(var(--border))] max-w-3xl mx-auto animate-in" style={{ animationDelay: '0.4s' }}>
            <p className="text-sm text-[hsl(var(--muted-foreground))] mb-4">Trusted by researchers from top institutions</p>
            <div className="flex flex-wrap justify-center gap-8 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos - using text for now to keep it clean */}
              <span className="font-semibold text-lg">Stanford</span>
              <span className="font-semibold text-lg">MIT</span>
              <span className="font-semibold text-lg">Berkeley</span>
              <span className="font-semibold text-lg">Oxford</span>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-[hsl(var(--secondary))]/30 border-y border-[hsl(var(--border))]">
        <div className="container-width">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Everything you need to publish</h2>
            <p className="text-[hsl(var(--muted-foreground))] text-lg">
              Focus on your research while we handle the formatting, citations, and structure.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: Wand2,
                title: "AI Generation",
                desc: "Generate comprehensive first drafts with proper citations and academic tone in seconds.",
                href: "/generate"
              },
              {
                icon: FileText,
                title: "IEEE Formatting",
                desc: "Automatic conversion to standard IEEE 2-column format with proper styling.",
                href: "/editor"
              },
              {
                icon: Shield,
                title: "Plagiarism Check",
                desc: "Detect plagiarism, see matching sources, and get AI rewrites for originality.",
                href: "/plagiarism"
              },
              {
                icon: Bot,
                title: "AI Detection",
                desc: "Identify AI-generated content and humanize it to bypass AI detectors.",
                href: "/ai-detection"
              },
              {
                icon: BookOpen,
                title: "Reference Manager",
                desc: "Auto-fetch citations via DOI and format them perfectly in any style.",
                href: null
              },
              {
                icon: Download,
                title: "Multi-format Export",
                desc: "Export to PDF, DOCX, LaTeX, or BibTeX with one click.",
                href: null
              }
            ].map((feature, i) => (
              <Link
                key={i}
                href={feature.href || '#'}
                className={`group p-6 bg-[hsl(var(--card))] rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--primary))]/50 hover:shadow-md transition-all duration-200 ${!feature.href ? 'cursor-default' : ''}`}
              >
                <div className="w-12 h-12 rounded-lg bg-[hsl(var(--secondary))] flex items-center justify-center mb-4 group-hover:bg-[hsl(var(--primary))] group-hover:text-[hsl(var(--primary-foreground))] transition-colors">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-[hsl(var(--muted-foreground))] leading-relaxed">
                  {feature.desc}
                </p>
                {feature.href && (
                  <div className="mt-4 flex items-center text-sm font-medium text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity -translate-x-2 group-hover:translate-x-0 duration-200">
                    Try it now <ArrowRight className="ml-1 w-4 h-4" />
                  </div>
                )}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Value Props */}
      <section className="py-24">
        <div className="container-width">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold tracking-tight mb-6">Write faster, publish sooner.</h2>
              <div className="space-y-4">
                {[
                  "Intelligent autocomplete and suggestions",
                  "Automatic citation formatting (APA, MLA, IEEE)",
                  "Real-time collaboration with your team",
                  "Export to PDF, Word, and LaTeX"
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                    <span className="text-[hsl(var(--foreground))]">{item}</span>
                  </div>
                ))}
              </div>
              <div className="mt-8">
                <Link href="/register" className="btn-primary rounded-full px-8">
                  Get Started for Free
                </Link>
              </div>
            </div>
            <div className="relative h-[400px] bg-[hsl(var(--secondary))] rounded-2xl border border-[hsl(var(--border))] overflow-hidden flex items-center justify-center">
              <div className="text-[hsl(var(--muted-foreground))]">App Screenshot Placeholder</div>
              {/* You can replace this with an actual Image component later */}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
        <div className="container-width flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[hsl(var(--primary))] flex items-center justify-center text-[hsl(var(--primary-foreground))] font-bold">
              A
            </div>
            <span className="font-bold text-lg">ARPS</span>
          </div>
          <div className="flex gap-8 text-sm text-[hsl(var(--muted-foreground))]">
            <Link href="#" className="hover:text-[hsl(var(--foreground))]">Privacy</Link>
            <Link href="#" className="hover:text-[hsl(var(--foreground))]">Terms</Link>
            <Link href="#" className="hover:text-[hsl(var(--foreground))]">Contact</Link>
          </div>
          <p className="text-sm text-[hsl(var(--muted-foreground))]">
            © 2024 ARPS Inc.
          </p>
        </div>
      </footer>
    </div>
  );
}
