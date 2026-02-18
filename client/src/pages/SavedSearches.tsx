import { Sidebar, Header } from "@/components/Navigation";
import { useSavedSearches, useDeleteSavedSearch } from "@/hooks/use-saved-searches";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Search } from "lucide-react";
import { format } from "date-fns";

export default function SavedSearches() {
  const { data: searches } = useSavedSearches();
  const deleteMutation = useDeleteSavedSearch();

  const handleDelete = (id: number) => {
    if (confirm("Delete this saved search?")) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="lg:pl-64">
        <Header title="Saved Searches" />

        <div className="p-8 max-w-5xl mx-auto space-y-4">
          {searches?.length === 0 ? (
            <div className="text-center py-20 text-slate-500">
              <Search className="w-12 h-12 mx-auto mb-4 text-slate-300" />
              <p>No saved searches found.</p>
            </div>
          ) : (
            searches?.map((search) => (
              <Card key={search.id} className="p-6 flex items-center justify-between border-border/50">
                <div>
                  <h3 className="font-semibold text-lg text-slate-900 mb-2">{search.name}</h3>
                  <div className="flex gap-2 mb-2">
                    {Object.entries(search.filters as Record<string, string>).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="bg-slate-50 text-xs">
                        {key}: {value}
                      </Badge>
                    ))}
                  </div>
                  <p className="text-xs text-slate-400">
                    Created {format(new Date(search.createdAt!), "MMM d, yyyy")}
                  </p>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="text-red-500 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(search.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
