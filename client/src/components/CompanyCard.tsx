import { Company } from "@shared/schema";
import { Link } from "wouter";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Globe, MapPin } from "lucide-react";

export function CompanyCard({ company }: { company: Company }) {
  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-emerald-50 text-emerald-700 border-emerald-200";
    if (score >= 50) return "bg-amber-50 text-amber-700 border-amber-200";
    return "bg-slate-50 text-slate-700 border-slate-200";
  };

  return (
    <Link href={`/companies/${company.id}`}>
      <Card className="group p-5 hover:shadow-lg transition-all duration-300 cursor-pointer border-border/50 hover:border-primary/20 hover:-translate-y-0.5">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            {company.logoUrl ? (
              <img 
                src={company.logoUrl} 
                alt={company.name} 
                className="w-12 h-12 rounded-lg object-cover border border-border"
              />
            ) : (
              <div className="w-12 h-12 rounded-lg bg-primary/5 flex items-center justify-center text-primary font-bold text-lg border border-primary/10">
                {company.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <h3 className="font-semibold text-lg text-slate-900 group-hover:text-primary transition-colors">
                {company.name}
              </h3>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <Globe className="w-3 h-3" />
                <span className="truncate max-w-[120px]">{company.website.replace('https://', '')}</span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={getScoreColor(company.score || 0)}>
            {company.score}/100
          </Badge>
        </div>

        <p className="text-sm text-slate-600 line-clamp-2 mb-4 h-10">
          {company.description || "No description available."}
        </p>

        <div className="flex items-center gap-2 flex-wrap">
          {company.sector && (
            <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600">
              {company.sector}
            </Badge>
          )}
          {company.location && (
            <Badge variant="secondary" className="font-normal bg-slate-100 text-slate-600">
              <MapPin className="w-3 h-3 mr-1" />
              {company.location}
            </Badge>
          )}
        </div>
      </Card>
    </Link>
  );
}
