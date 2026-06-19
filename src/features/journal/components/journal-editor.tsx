"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createJournal, updateJournal } from "@/features/journal/actions";
import { DESTINATIONS } from "@/constants/destinations";
import { routes } from "@/constants/routes";
import type { JournalRow } from "@/types/db";

interface JournalEditorProps {
  mode: "create" | "edit";
  journal?: JournalRow;
  initialDestinationSlug?: string | null;
}

export function JournalEditor({
  mode,
  journal,
  initialDestinationSlug,
}: JournalEditorProps) {
  const router = useRouter();
  const [title, setTitle] = useState(journal?.title ?? "");
  const [excerpt, setExcerpt] = useState(journal?.excerpt ?? "");
  const [body, setBody] = useState(journal?.body ?? "");
  const [visibility, setVisibility] = useState<"private" | "public">(
    journal?.visibility ?? "private",
  );
  const [destinationSlug, setDestinationSlug] = useState(
    initialDestinationSlug ?? "",
  );
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    setFieldErrors({});
    setPending(true);
    try {
      const payload = {
        title: title.trim(),
        excerpt: excerpt.trim() ? excerpt.trim() : null,
        bodyMarkdown: body,
        destinationSlug: destinationSlug || null,
        visibility,
      };
      if (mode === "create") {
        const res = await createJournal(payload);
        if (!res.ok) {
          setError(res.error.message);
          if (res.error.fields) setFieldErrors(res.error.fields);
          return;
        }
        router.push(`${routes.journalEntry(res.data.slug)}/edit`);
      } else if (journal) {
        const res = await updateJournal({ id: journal.id, ...payload });
        if (!res.ok) {
          setError(res.error.message);
          if (res.error.fields) setFieldErrors(res.error.fields);
          return;
        }
        setNotice("Saved.");
        router.refresh();
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {error && (
        <p role="alert" className="text-sm text-destructive">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="text-sm text-accent-green">
          {notice}
        </p>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="j-title">Title</Label>
        <Input
          id="j-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. 7 Days in Bali"
          required
          aria-invalid={fieldErrors.title ? true : undefined}
        />
        {fieldErrors.title && (
          <p className="text-sm text-destructive">{fieldErrors.title}</p>
        )}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="j-excerpt">Excerpt</Label>
        <Input
          id="j-excerpt"
          value={excerpt}
          onChange={(e) => setExcerpt(e.target.value)}
          placeholder="A one-line teaser (optional)"
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="j-body">Story</Label>
        <Textarea
          id="j-body"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          rows={12}
          placeholder={"Write your story.\n\nUse ## for headings and - for bullet points."}
          required
          aria-invalid={fieldErrors.bodyMarkdown ? true : undefined}
        />
        {fieldErrors.bodyMarkdown && (
          <p className="text-sm text-destructive">{fieldErrors.bodyMarkdown}</p>
        )}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="j-destination">Destination</Label>
          <select
            id="j-destination"
            value={destinationSlug}
            onChange={(e) => setDestinationSlug(e.target.value)}
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">None</option>
            {DESTINATIONS.map((d) => (
              <option key={d.slug} value={d.slug}>
                {d.name}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="j-visibility">Visibility</Label>
          <select
            id="j-visibility"
            value={visibility}
            onChange={(e) =>
              setVisibility(e.target.value as "private" | "public")
            }
            className="h-11 w-full rounded-md border border-input bg-card px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="private">Private (only you)</option>
            <option value="public">Public (shown in the feed)</option>
          </select>
        </div>
      </div>

      <Button type="submit" disabled={pending} size="lg">
        {pending
          ? "Saving…"
          : mode === "create"
            ? "Create journal"
            : "Save changes"}
      </Button>
    </form>
  );
}
