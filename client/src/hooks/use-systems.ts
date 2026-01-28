import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";

export function useSystems() {
  return useQuery({
    queryKey: [api.systems.list.path],
    queryFn: async () => {
      const res = await fetch(api.systems.list.path);
      if (!res.ok) throw new Error("Failed to fetch systems");
      return api.systems.list.responses[200].parse(await res.json());
    },
  });
}

export function useSystemDetails(id: string) {
  return useQuery({
    queryKey: [api.systems.details.path, id],
    queryFn: async () => {
      const url = buildUrl(api.systems.details.path, { id });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch system details");
      return api.systems.details.responses[200].parse(await res.json());
    },
    enabled: !!id,
  });
}

export function useAnalytics(systemId?: string) {
  return useQuery({
    queryKey: [api.analytics.get.path, systemId],
    queryFn: async () => {
      if (!systemId) throw new Error("System ID required");
      const url = buildUrl(api.analytics.get.path, { systemId });
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return api.analytics.get.responses[200].parse(await res.json());
    },
    enabled: !!systemId,
  });
}

export function useGlobalAnalytics() {
  return useQuery({
    queryKey: [api.analytics.global.path],
    queryFn: async () => {
      const res = await fetch(api.analytics.global.path);
      if (!res.ok) throw new Error("Failed to fetch global analytics");
      return api.analytics.global.responses[200].parse(await res.json());
    },
  });
}

export function useScanRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (systemIds: string[]) => {
      const res = await fetch(api.scan.request.path, {
        method: api.scan.request.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ systemIds }),
      });
      if (!res.ok) throw new Error("Scan request failed");
      return api.scan.request.responses[200].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.scan.list.path] });
    },
  });
}

export function useScanHistory() {
  return useQuery({
    queryKey: [api.scan.list.path],
    queryFn: async () => {
      const res = await fetch(api.scan.list.path);
      if (!res.ok) throw new Error("Failed to fetch scan history");
      return api.scan.list.responses[200].parse(await res.json());
    },
  });
}

export function useChatbot() {
  return useMutation({
    mutationFn: async (query: string) => {
      const res = await fetch(api.chatbot.ask.path, {
        method: api.chatbot.ask.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      if (!res.ok) throw new Error("Chatbot failed");
      return api.chatbot.ask.responses[200].parse(await res.json());
    },
  });
}
