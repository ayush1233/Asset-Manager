import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertCompany, UpdateCompanyRequest } from "@shared/schema";

export function useCompanies(filters?: { 
  search?: string; 
  sector?: string; 
  stage?: string;
  location?: string;
}) {
  return useQuery({
    queryKey: [api.companies.list.path, filters],
    queryFn: async () => {
      const url = buildUrl(api.companies.list.path);
      const params = new URLSearchParams();
      if (filters?.search) params.append("search", filters.search);
      if (filters?.sector && filters.sector !== "all") params.append("sector", filters.sector);
      if (filters?.stage && filters.stage !== "all") params.append("stage", filters.stage);
      
      const res = await fetch(`${url}?${params.toString()}`, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch companies");
      return api.companies.list.responses[200].parse(await res.json());
    },
  });
}

export function useCompany(id: number) {
  return useQuery({
    queryKey: [api.companies.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.companies.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (res.status === 404) return null;
      if (!res.ok) throw new Error("Failed to fetch company");
      return api.companies.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertCompany) => {
      const res = await fetch(api.companies.create.path, {
        method: api.companies.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || "Failed to create company");
      }
      return api.companies.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.companies.list.path] });
      toast({ title: "Success", description: "Company added to database" });
    },
    onError: (error) => {
      toast({ 
        title: "Error", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}

export function useUpdateCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCompanyRequest & { id: number }) => {
      const url = buildUrl(api.companies.update.path, { id });
      const res = await fetch(url, {
        method: api.companies.update.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to update company");
      return api.companies.update.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.companies.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.companies.get.path, data.id] });
      toast({ title: "Updated", description: "Company details updated successfully" });
    },
  });
}

export function useDeleteCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.companies.delete.path, { id });
      const res = await fetch(url, { method: api.companies.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete company");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.companies.list.path] });
      toast({ title: "Deleted", description: "Company removed from database" });
    },
  });
}

export function useEnrichCompany() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.companies.enrich.path, { id });
      const res = await fetch(url, { 
        method: api.companies.enrich.method,
        credentials: "include" 
      });
      
      if (!res.ok) throw new Error("Failed to enrich company data");
      return api.companies.enrich.responses[200].parse(await res.json());
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [api.companies.get.path, data.id] });
      toast({ 
        title: "Enrichment Complete", 
        description: "New signals and data have been added." 
      });
    },
    onError: (error) => {
      toast({ 
        title: "Enrichment Failed", 
        description: error.message, 
        variant: "destructive" 
      });
    },
  });
}
