"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Download, Loader2, Inbox } from "lucide-react";

interface Submission {
  id: string;
  respondent_name: string;
  respondent_email: string;
  pdf_url: string | null;
  submitted_at: string;
}

export default function SubmissionsPage() {
  const params = useParams();
  const formId = params.id as string;
  const supabase = createClient();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [formTitle, setFormTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data: form } = await supabase
        .from("forms")
        .select("title")
        .eq("id", formId)
        .single();

      if (form) setFormTitle(form.title);

      const { data } = await supabase
        .from("submissions")
        .select("*")
        .eq("form_id", formId)
        .order("submitted_at", { ascending: false });

      if (data) setSubmissions(data);
      setLoading(false);
    }

    load();
  }, [formId, supabase]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild className="mb-2">
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Submissions</h1>
        <p className="text-muted-foreground text-sm">{formTitle}</p>
      </div>

      {submissions.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-1">No submissions yet</h2>
            <p className="text-sm text-muted-foreground">
              Share your form link to start collecting responses
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <Card key={sub.id}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">
                    {sub.respondent_name}
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">
                    {new Date(sub.submitted_at).toLocaleString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {sub.respondent_email}
                  </span>
                  {sub.pdf_url && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={sub.pdf_url} target="_blank" rel="noopener noreferrer">
                        <Download className="h-3.5 w-3.5" />
                        Download PDF
                      </a>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
