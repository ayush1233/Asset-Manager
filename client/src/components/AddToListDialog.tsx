import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLists, useAddListItem } from "@/hooks/use-lists";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function AddToListDialog({ companyId, trigger }: { companyId: number, trigger?: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { data: lists } = useLists();
  const addMutation = useAddListItem();

  const handleAdd = async (listId: number) => {
    await addMutation.mutateAsync({ listId, companyId });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Plus className="h-4 w-4" />
            Add to List
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to List</DialogTitle>
        </DialogHeader>
        <div className="grid gap-2 py-4">
          {lists?.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-4">
              No lists created yet.
            </p>
          )}
          {lists?.map((list) => (
            <Button
              key={list.id}
              variant="ghost"
              className={cn(
                "justify-start text-left h-auto py-3 px-4",
                "hover:bg-primary/5 hover:text-primary"
              )}
              onClick={() => handleAdd(list.id)}
              disabled={addMutation.isPending}
            >
              <div className="flex flex-col gap-1">
                <span className="font-medium">{list.name}</span>
                {list.description && (
                  <span className="text-xs text-muted-foreground font-normal">
                    {list.description}
                  </span>
                )}
              </div>
            </Button>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
