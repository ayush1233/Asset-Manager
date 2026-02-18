import { Sidebar, Header } from "@/components/Navigation";
import { useLists, useCreateList, useDeleteList } from "@/hooks/use-lists";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Plus, Trash2, Folder, ChevronRight } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";

export default function Lists() {
  const { data: lists } = useLists();
  const createMutation = useCreateList();
  const deleteMutation = useDeleteList();
  const [newListName, setNewListName] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleCreate = async () => {
    if (!newListName.trim()) return;
    await createMutation.mutateAsync({ name: newListName, description: "" });
    setNewListName("");
    setDialogOpen(false);
  };

  const handleDelete = (e: React.MouseEvent, id: number) => {
    e.preventDefault(); // Prevent navigation
    if (confirm("Are you sure you want to delete this list?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="lg:pl-64">
        <Header title="Lists">
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Create List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>New List</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <Input 
                  placeholder="List Name" 
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                />
                <Button onClick={handleCreate} disabled={createMutation.isPending} className="w-full">
                  Create
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </Header>

        <div className="p-8 max-w-5xl mx-auto grid gap-4">
          {lists?.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Folder className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>You haven't created any lists yet.</p>
            </div>
          ) : (
            lists?.map((list) => (
              <Link key={list.id} href={`/lists/${list.id}`}>
                <Card className="group p-6 flex items-center justify-between hover:shadow-md transition-all cursor-pointer border-border/50">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                      <Folder className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-slate-900">{list.name}</h3>
                      <p className="text-sm text-slate-500">
                        Created {format(new Date(list.createdAt!), "MMM d, yyyy")}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                      onClick={(e) => handleDelete(e, list.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <ChevronRight className="text-slate-300" />
                  </div>
                </Card>
              </Link>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
