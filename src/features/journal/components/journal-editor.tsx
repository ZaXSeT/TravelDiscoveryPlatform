"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { createJournal, updateJournal } from "@/features/journal/actions";
import { DESTINATIONS, EXPLORE_DESTINATIONS } from "@/constants/destinations";
import { DestinationPicker } from "@/features/trip-generator/components/destination-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
        toast.success("Journal created");
        router.push(`${routes.journalEntry(res.data.slug)}/edit`);
      } else if (journal) {
        const res = await updateJournal({ id: journal.id, ...payload });
        if (!res.ok) {
          setError(res.error.message);
          if (res.error.fields) setFieldErrors(res.error.fields);
          return;
        }
        setNotice("Saved.");
        toast.success(visibility === "public" ? "Journal published" : "Journal saved");
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
        <div className="space-y-1.5 z-50">
          <Label htmlFor="j-destination">Destination</Label>
          <DestinationPicker
            value={destinationSlug}
            onChange={setDestinationSlug}
            emptyLabel="None"
            options={[...DESTINATIONS, ...EXPLORE_DESTINATIONS]
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((d) => ({ slug: d.slug, name: d.name }))}
          />
        </div>
        <div className="space-y-1.5 z-40">
          <Label htmlFor="j-visibility">Visibility</Label>
          <Select
            value={visibility}
            onValueChange={(val) => setVisibility(val as "private" | "public")}
          >
            <SelectTrigger id="j-visibility" className="h-11 w-full bg-card">
              <SelectValue placeholder="Select visibility" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="private">Private (only you)</SelectItem>
              <SelectItem value="public">Public (shown in the feed)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button variant="gold" type="submit" disabled={pending} size="lg">
        {pending
          ? "Saving…"
          : mode === "create"
            ? "Create journal"
            : "Save changes"}
      </Button>
    </form>
  );
}
