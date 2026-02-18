import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

export function useNotes(companyId: number) {
  return useQuery({
    queryKey: [api.notes.list.path, companyId],
    queryFn: async () => {
      const url = buildUrl(api.notes.list.path, { companyId });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch notes");
      return api.notes.list.responses[200].parse(await res.json());
    },
    enabled: !!companyId,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ companyId, content }: { companyId: number; content: string }) => {
      const url = buildUrl(api.notes.create.path, { companyId });
      const res = await fetch(url, {
        method: api.notes.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to create note");
      return api.notes.create.responses[201].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.notes.list.path, variables.companyId] });
      toast({ title: "Note Added", description: "Your note has been saved." });
    },
  });
}
