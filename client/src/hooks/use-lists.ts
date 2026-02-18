import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";
import type { InsertList } from "@shared/schema";

export function useLists() {
  return useQuery({
    queryKey: [api.lists.list.path],
    queryFn: async () => {
      const res = await fetch(api.lists.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch lists");
      return api.lists.list.responses[200].parse(await res.json());
    },
  });
}

export function useList(id: number) {
  return useQuery({
    queryKey: [api.lists.get.path, id],
    queryFn: async () => {
      const url = buildUrl(api.lists.get.path, { id });
      const res = await fetch(url, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch list");
      return api.lists.get.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useCreateList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InsertList) => {
      const res = await fetch(api.lists.create.path, {
        method: api.lists.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to create list");
      return api.lists.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lists.list.path] });
      toast({ title: "List Created" });
    },
  });
}

export function useDeleteList() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: number) => {
      const url = buildUrl(api.lists.delete.path, { id });
      const res = await fetch(url, { method: api.lists.delete.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to delete list");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.lists.list.path] });
      toast({ title: "List Deleted" });
    },
  });
}

export function useAddListItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listId, companyId }: { listId: number; companyId: number }) => {
      const url = buildUrl(api.lists.addItem.path, { id: listId });
      const res = await fetch(url, {
        method: api.lists.addItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to add item to list");
      return api.lists.addItem.responses[201].parse(await res.json());
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [api.lists.get.path, vars.listId] });
      toast({ title: "Company added to list" });
    },
  });
}

export function useRemoveListItem() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ listId, companyId }: { listId: number; companyId: number }) => {
      const url = buildUrl(api.lists.removeItem.path, { id: listId, companyId });
      const res = await fetch(url, { method: api.lists.removeItem.method, credentials: "include" });
      if (!res.ok) throw new Error("Failed to remove item");
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: [api.lists.get.path, vars.listId] });
      toast({ title: "Company removed from list" });
    },
  });
}
