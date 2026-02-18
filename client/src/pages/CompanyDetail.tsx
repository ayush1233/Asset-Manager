import { useCompany, useEnrichCompany } from "@/hooks/use-companies";
import { useNotes, useCreateNote } from "@/hooks/use-notes";
import { Sidebar, Header } from "@/components/Navigation";
import { AddToListDialog } from "@/components/AddToListDialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Globe,
  MapPin,
  Sparkles,
  TrendingUp,
  Clock,
  ExternalLink,
  Target,
  ArrowLeft
} from "lucide-react";
import { useRoute, Link } from "wouter";
import { motion } from "framer-motion";
import { useState } from "react";
import { format } from "date-fns";

export default function CompanyDetail() {
  const [_, params] = useRoute("/companies/:id");
  const id = parseInt(params?.id || "0");
  const { data: company, isLoading } = useCompany(id);
  const enrichMutation = useEnrichCompany();
  const { data: notes } = useNotes(id);
  const createNoteMutation = useCreateNote();
  const [noteContent, setNoteContent] = useState("");

  if (isLoading) return <DetailSkeleton />;
  if (!company) return <div>Not found</div>;

  const handleEnrich = () => {
    enrichMutation.mutate(id);
  };

  const handleAddNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;
    createNoteMutation.mutate({ companyId: id, content: noteContent }, {
      onSuccess: () => setNoteContent("")
    });
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="lg:pl-64 pb-20">
        <Header title={company.name}>
          <div className="flex gap-2">
            <Link href="/companies">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <AddToListDialog companyId={id} />
            <Button 
              onClick={handleEnrich} 
              disabled={enrichMutation.isPending}
              className="bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white shadow-lg shadow-indigo-200"
            >
              {enrichMutation.isPending ? (
                <>Enriching...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enrich Data
                </>
              )}
            </Button>
          </div>
        </Header>

        <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Overview Card */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Card className="p-8 border-border/50 shadow-sm">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-2xl font-display font-bold text-slate-900 mb-2">Overview</h2>
                    <div className="flex items-center gap-4 text-slate-500">
                      <a href={company.website} target="_blank" rel="noreferrer" className="flex items-center hover:text-primary transition-colors">
                        <Globe className="w-4 h-4 mr-1.5" />
                        {company.website.replace('https://', '')}
                      </a>
                      {company.location && (
                        <div className="flex items-center">
                          <MapPin className="w-4 h-4 mr-1.5" />
                          {company.location}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {company.sector && <Badge variant="secondary">{company.sector}</Badge>}
                    {company.stage && <Badge variant="secondary">{company.stage}</Badge>}
                  </div>
                </div>
                
                <p className="text-lg text-slate-700 leading-relaxed">
                  {company.description}
                </p>

                {company.lastEnrichedAt && (
                  <div className="mt-6 pt-6 border-t border-border flex items-center text-sm text-slate-400">
                    <Clock className="w-4 h-4 mr-2" />
                    Last enriched {format(new Date(company.lastEnrichedAt), "MMM d, yyyy")}
                  </div>
                )}
              </Card>
            </motion.div>

            {/* AI Insights Panel */}
            {company.enrichmentStatus === "completed" && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="grid gap-6"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-6 bg-gradient-to-br from-indigo-50 to-white border-indigo-100">
                    <h3 className="font-semibold flex items-center gap-2 text-indigo-900 mb-4">
                      <Target className="w-5 h-5 text-indigo-600" />
                      What They Do
                    </h3>
                    <ul className="space-y-2">
                      {company.whatTheyDo?.map((item, i) => (
                        <li key={i} className="flex items-start gap-2 text-indigo-800 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-indigo-400 shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </Card>

                  <Card className="p-6 bg-gradient-to-br from-emerald-50 to-white border-emerald-100">
                    <h3 className="font-semibold flex items-center gap-2 text-emerald-900 mb-4">
                      <TrendingUp className="w-5 h-5 text-emerald-600" />
                      Derived Signals
                    </h3>
                    <ul className="space-y-2">
                      {company.derivedSignals?.map((signal, i) => (
                        <li key={i} className="flex items-start gap-2 text-emerald-800 text-sm">
                          <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                          {signal}
                        </li>
                      ))}
                    </ul>
                  </Card>
                </div>
              </motion.div>
            )}
            
            {/* Notes Section */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <h3 className="text-xl font-bold mb-4">Notes</h3>
              <div className="space-y-4 mb-6">
                {notes?.map((note) => (
                  <Card key={note.id} className="p-4 bg-white/50">
                    <p className="text-slate-800 whitespace-pre-wrap">{note.content}</p>
                    <div className="mt-2 text-xs text-slate-400">
                      {format(new Date(note.createdAt!), "MMM d, h:mm a")}
                    </div>
                  </Card>
                ))}
              </div>
              <form onSubmit={handleAddNote} className="space-y-3">
                <Textarea
                  placeholder="Add a private note..."
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  className="min-h-[100px] bg-white"
                />
                <Button 
                  type="submit" 
                  disabled={createNoteMutation.isPending || !noteContent.trim()}
                >
                  Save Note
                </Button>
              </form>
            </motion.div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-6">
            <Card className="p-6 border-border/50">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Score Analysis
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-4xl font-bold text-slate-900">{company.score}</span>
                <span className="text-slate-400 mb-1">/ 100</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full" 
                  style={{ width: `${company.score}%` }} 
                />
              </div>
              <p className="text-sm text-slate-500 mt-4">
                Based on market presence, team growth, and funding signals.
              </p>
            </Card>

            <Card className="p-6 border-border/50">
              <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
                Tags & Keywords
              </h3>
              <div className="flex flex-wrap gap-2">
                {company.keywords?.map((keyword, i) => (
                  <Badge key={i} variant="outline" className="bg-slate-50">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50/50">
      <Sidebar />
      <main className="lg:pl-64">
        <div className="h-16 border-b bg-white" />
        <div className="max-w-7xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <Skeleton className="h-[300px] w-full rounded-xl" />
            <div className="grid grid-cols-2 gap-6">
              <Skeleton className="h-[200px] rounded-xl" />
              <Skeleton className="h-[200px] rounded-xl" />
            </div>
          </div>
          <div className="space-y-6">
            <Skeleton className="h-[200px] w-full rounded-xl" />
            <Skeleton className="h-[300px] w-full rounded-xl" />
          </div>
        </div>
      </main>
    </div>
  );
}
