import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FileText, Upload, Share2, Mail, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="flex flex-col items-center justify-center text-center px-4 py-20 md:py-32">
        <div className="inline-flex items-center gap-2 rounded-full border bg-muted px-4 py-1.5 text-sm text-muted-foreground mb-6">
          <FileText className="h-4 w-4" />
          Turn any form into a shareable link
        </div>
        <h1 className="text-4xl md:text-6xl font-bold tracking-tight max-w-3xl">
          Stop printing forms.
          <br />
          <span className="text-muted-foreground">Start sharing them.</span>
        </h1>
        <p className="mt-4 text-lg text-muted-foreground max-w-xl">
          Upload any PDF or paper form. AI creates a fillable web form with
          signature support. Get completed submissions as PDFs delivered to both
          parties.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" asChild>
            <Link href="/login">
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-12">
            How it works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Upload className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">1. Upload</h3>
              <p className="text-sm text-muted-foreground">
                Upload a PDF or photo of any form. Our AI analyzes it and
                creates a fillable web form automatically.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Share2 className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">2. Share</h3>
              <p className="text-sm text-muted-foreground">
                Get a shareable link and send it to anyone. They can fill it out
                on any device — no account needed.
              </p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">3. Collect</h3>
              <p className="text-sm text-muted-foreground">
                Both you and the respondent receive the completed form as a
                professional PDF via email.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-20">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-2xl font-bold text-center mb-12">
            Everything you need
          </h2>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              {
                title: "AI-Powered Parsing",
                desc: "Upload any form and our AI extracts all fields automatically. No manual setup needed.",
              },
              {
                title: "Signature Support",
                desc: "Built-in draw-to-sign signature capture. Works on desktop and mobile.",
              },
              {
                title: "PDF Generation",
                desc: "Every submission is converted to a professional PDF with all fields and signatures.",
              },
              {
                title: "Email Delivery",
                desc: "Both parties receive the completed PDF via email. No downloads, no follow-ups.",
              },
            ].map((feature, i) => (
              <div key={i} className="rounded-lg border p-6">
                <h3 className="font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 px-4 py-16">
        <div className="container mx-auto max-w-xl text-center">
          <h2 className="text-2xl font-bold mb-4">Ready to digitize your forms?</h2>
          <p className="text-muted-foreground mb-6">
            Free to use. No credit card required.
          </p>
          <Button size="lg" asChild>
            <Link href="/login">
              Create Your First Form
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t px-4 py-6">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          Form Beast
        </div>
      </footer>
    </div>
  );
}
