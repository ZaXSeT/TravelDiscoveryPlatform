"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteJournal } from "@/features/journal/actions";
import { routes } from "@/constants/routes";

export function DeleteJournalButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onDelete = async () => {
    if (!window.confirm("Delete this journal? This cannot be undone.")) return;
    setPending(true);
    const res = await deleteJournal(id);
    if (res.ok) {
      toast.success("Journal deleted");
      router.push(routes.profile);
      router.refresh();
    } else {
      toast.error("Couldn't delete the journal — please try again.");
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="outline"
      onClick={onDelete}
      disabled={pending}
      className="gap-2 text-destructive"
    >
      <Trash2 className="size-4" />
      {pending ? "Deleting…" : "Delete journal"}
    </Button>
  );
}
