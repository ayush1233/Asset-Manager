import { Sidebar, Header } from "@/components/Navigation";
import { useList, useRemoveListItem } from "@/hooks/use-lists";
import { useRoute } from "wouter";
import { CompanyCard } from "@/components/CompanyCard";
import { Button } from "@/components/ui/button";
import { Trash2, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function ListDetail() {
  const [_, params] = useRoute("/lists/:id");
  const id = parseInt(params?.id || "0");
  const { data, isLoading } = useList(id);
  const removeMutation = useRemoveListItem();

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>List not found</div>;

  const handleRemove = (companyId: number) => {
    if (confirm("Remove company from this list?")) {
      removeMutation.mutate({ listId: id, companyId });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="lg:pl-64">
        <Header title={data.list.name}>
          <Link href="/lists">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Lists
            </Button>
          </Link>
        </Header>

        <div className="p-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.items.length === 0 ? (
              <div className="col-span-full text-center py-20 text-slate-500">
                This list is empty. Add companies from the companies page.
              </div>
            ) : (
              data.items.map((company) => (
                <div key={company.id} className="relative group">
                  <CompanyCard company={company} />
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
                    onClick={(e) => {
                      e.preventDefault();
                      handleRemove(company.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
