"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import {
  Plus,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Pencil,
  Inbox,
} from "lucide-react";

interface Form {
  id: string;
  title: string;
  description: string | null;
  status: string;
  share_token: string;
  created_at: string;
  submissions: { count: number }[];
}

export default function DashboardPage() {
  const [forms, setForms] = useState<Form[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();
  const { toast } = useToast();

  useEffect(() => {
    async function loadForms() {
      const { data } = await supabase
        .from("forms")
        .select("*, submissions(count)")
        .order("created_at", { ascending: false });

      if (data) {
        setForms(data as unknown as Form[]);
      }
      setLoading(false);
    }

    loadForms();
  }, [supabase]);

  function copyShareLink(shareToken: string) {
    const link = `${window.location.origin}/f/${shareToken}`;
    navigator.clipboard.writeText(link);
    toast({ title: "Link copied!", description: link });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-3.5rem)]">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Your Forms</h1>
          <p className="text-muted-foreground text-sm">
            Manage your forms and view submissions
          </p>
        </div>
        <Button asChild>
          <Link href="/forms/new">
            <Plus className="h-4 w-4" />
            New Form
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-16">
            <FileText className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-lg font-semibold mb-1">No forms yet</h2>
            <p className="text-sm text-muted-foreground mb-4">
              Upload a form to get started
            </p>
            <Button asChild>
              <Link href="/forms/new">
                <Plus className="h-4 w-4" />
                Create Your First Form
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {forms.map((form) => {
            const subCount = form.submissions?.[0]?.count || 0;
            return (
              <Card key={form.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{form.title}</CardTitle>
                      {form.description && (
                        <CardDescription className="line-clamp-1">
                          {form.description}
                        </CardDescription>
                      )}
                    </div>
                    <Badge
                      variant={form.status === "published" ? "default" : "secondary"}
                    >
                      {form.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Inbox className="h-3.5 w-3.5" />
                        {subCount} submission{subCount !== 1 ? "s" : ""}
                      </span>
                      <span>
                        Created {new Date(form.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/forms/${form.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Link>
                      </Button>
                      {form.status === "published" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyShareLink(form.share_token)}
                          >
                            <Copy className="h-3.5 w-3.5" />
                            Copy Link
                          </Button>
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/f/${form.share_token}`} target="_blank">
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </Button>
                        </>
                      )}
                      {subCount > 0 && (
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/forms/${form.id}/submissions`}>
                            <Inbox className="h-3.5 w-3.5" />
                            Submissions
                          </Link>
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
