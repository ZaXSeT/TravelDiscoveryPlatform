"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { deleteAccount } from "@/features/profile/actions";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import { routes } from "@/constants/routes";

export function DeleteAccountButton() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState("");

  const canDelete = confirm.trim().toUpperCase() === "DELETE";

  const onDelete = async () => {
    if (!canDelete) return;
    setPending(true);
    const res = await deleteAccount();
    if (!res.ok) {
      setPending(false);
      toast.error(res.error.message);
      return;
    }
    // Clear the now-invalid local session, then leave.
    await getSupabaseBrowserClient().auth.signOut();
    toast.success("Your account has been deleted.");
    router.push(routes.home);
    router.refresh();
  };

  return (
    <div className="rounded-2xl border border-destructive/30 bg-destructive/5 p-6">
      <h3 className="font-display text-xl text-foreground">Delete account</h3>
      <p className="mt-2 max-w-prose text-sm text-muted-foreground">
        Permanently delete your account and everything in it — saved destinations, trips,
        and journals. This cannot be undone.
      </p>
      <Button
        variant="outline"
        className="mt-4 border-destructive/40 text-destructive hover:bg-destructive hover:text-white"
        onClick={() => {
          setConfirm("");
          setOpen(true);
        }}
      >
        Delete account
      </Button>

      <Dialog open={open} onOpenChange={(o) => !pending && setOpen(o)}>
        <DialogContent className="left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl p-6">
          <div className="flex items-center gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertTriangle className="size-5" />
            </span>
            <DialogTitle className="font-display text-xl">
              Delete your account?
            </DialogTitle>
          </div>
          <DialogDescription className="mt-3 text-sm text-muted-foreground">
            This <strong className="text-foreground">permanently</strong> deletes your
            account and all your data — wishlist, trips, and journals. This action{" "}
            <strong className="text-foreground">cannot be undone</strong>.
          </DialogDescription>

          <div className="mt-4 space-y-1.5">
            <Label htmlFor="delete-confirm">
              Type <span className="font-semibold">DELETE</span> to confirm
            </Label>
            <Input
              id="delete-confirm"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="DELETE"
              autoComplete="off"
            />
          </div>

          <div className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={pending}>
                Cancel
              </Button>
            </DialogClose>
            <Button
              variant="destructive"
              disabled={!canDelete || pending}
              onClick={onDelete}
            >
              {pending ? "Deleting…" : "Delete account"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
