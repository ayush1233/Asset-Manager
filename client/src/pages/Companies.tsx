import { useState } from "react";
import { Sidebar, Header } from "@/components/Navigation";
import { useCompanies } from "@/hooks/use-companies";
import { CompanyCard } from "@/components/CompanyCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Search, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export default function Companies() {
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("all");
  const [stage, setStage] = useState("all");
  
  const { data: companies, isLoading } = useCompanies({ 
    search, 
    sector, 
    stage 
  });

  const sectors = Array.from(new Set(companies?.map(c => c.sector).filter(Boolean)));
  const stages = Array.from(new Set(companies?.map(c => c.stage).filter(Boolean)));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      
      <main className="lg:pl-64">
        <Header title="Companies">
          <Button variant="ghost" size="sm" className="text-slate-500">Help</Button>
        </Header>

        <div className="p-8 max-w-7xl mx-auto space-y-8">
          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-4 p-4 bg-white rounded-xl border border-border/50 shadow-sm">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input 
                placeholder="Search companies..." 
                className="pl-10 bg-slate-50 border-slate-200"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <Select value={sector} onValueChange={setSector}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Sector" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sectors</SelectItem>
                {sectors.map((s) => (
                  <SelectItem key={s} value={s as string}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={stage} onValueChange={setStage}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Stage" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Stages</SelectItem>
                {stages.map((s) => (
                  <SelectItem key={s} value={s as string}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Grid Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {companies?.length === 0 ? (
                <div className="col-span-full text-center py-20 text-slate-500">
                  No companies found matching your criteria.
                </div>
              ) : (
                companies?.map((company) => (
                  <CompanyCard key={company.id} company={company} />
                ))
              )}
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
