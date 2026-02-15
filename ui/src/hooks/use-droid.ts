import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api-client';

interface DroidHealthChecks {
  directoryExists: boolean;
  configExists: boolean;
  endpointConfigured: boolean;
  profileConfigured: boolean;
  endpointReachable: boolean;
  apiKeyValid: boolean | null;
  modelsAvailable: boolean | null;
}

interface DroidHealthDetails {
  endpointMessage: string;
  apiKeyMessage: string;
  modelsMessage: string;
}

export interface DroidStatusResponse {
  healthy: boolean;
  checks: DroidHealthChecks;
  details: DroidHealthDetails;
  config: {
    endpoint: string;
    profile: string;
    apiKeyConfigured: boolean;
  };
}

export interface DroidConfigResponse {
  endpoint: string;
  profile: string;
  apiKeyConfigured: boolean;
  updatedAt: string;
}

export interface UpdateDroidConfigPayload {
  endpoint?: string;
  profile?: string;
  apiKey?: string;
  clearApiKey?: boolean;
}

export interface UpdateDroidConfigResponse {
  success: boolean;
  config: DroidConfigResponse;
}

function fetchDroidStatus(): Promise<DroidStatusResponse> {
  return api.tools.request<DroidStatusResponse>('droid', '/status');
}

function fetchDroidConfig(): Promise<DroidConfigResponse> {
  return api.tools.request<DroidConfigResponse>('droid', '/config');
}

function fetchDroidDoctor(): Promise<{
  healthy: boolean;
  checks: DroidHealthChecks;
  details: DroidHealthDetails;
}> {
  return api.tools.request('droid', '/doctor');
}

function updateDroidConfig(payload: UpdateDroidConfigPayload): Promise<UpdateDroidConfigResponse> {
  return api.tools.request('droid', '/config', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}

export function useDroidStatus() {
  return useQuery({
    queryKey: ['tool', 'droid', 'status'],
    queryFn: fetchDroidStatus,
    refetchInterval: 10000,
    retry: 1,
  });
}

export function useDroidConfig() {
  return useQuery({
    queryKey: ['tool', 'droid', 'config'],
    queryFn: fetchDroidConfig,
    staleTime: 10000,
    retry: 1,
  });
}

export function useDroidDoctor() {
  return useQuery({
    queryKey: ['tool', 'droid', 'doctor'],
    queryFn: fetchDroidDoctor,
    staleTime: 5000,
    retry: 1,
  });
}

export function useUpdateDroidConfig() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateDroidConfig,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['tool', 'droid', 'status'] });
      void queryClient.invalidateQueries({ queryKey: ['tool', 'droid', 'config'] });
      void queryClient.invalidateQueries({ queryKey: ['tool', 'droid', 'doctor'] });
    },
  });
}
