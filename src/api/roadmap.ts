import { api } from './client';

export type FeatureStatus = 'planned' | 'in_progress' | 'done';

export interface Feature {
  id: string;
  title: string;
  status: FeatureStatus;
  position: number;
  version_id: string;
  inserted_at: string;
  updated_at: string;
}

export interface Version {
  id: string;
  name: string;
  position: number;
  features: Feature[];
  inserted_at: string;
  updated_at: string;
}

interface RoadmapResponse {
  versions: Version[];
}

interface VersionResponse {
  version: Version;
}

interface FeatureResponse {
  feature: Feature;
}

export async function getRoadmap(): Promise<Version[]> {
  const response = await api.get<RoadmapResponse>('/api/roadmap');
  return response.versions;
}

export async function createVersion(name: string): Promise<Version> {
  const response = await api.post<VersionResponse>('/api/roadmap/versions', { name });
  return response.version;
}

export async function updateVersion(id: string, updates: { name?: string; position?: number }): Promise<Version> {
  const response = await api.put<VersionResponse>(`/api/roadmap/versions/${id}`, updates);
  return response.version;
}

export async function deleteVersion(id: string): Promise<void> {
  await api.delete(`/api/roadmap/versions/${id}`);
}

export async function createFeature(
  title: string,
  version_id: string,
  status: FeatureStatus = 'planned'
): Promise<Feature> {
  const response = await api.post<FeatureResponse>('/api/roadmap/features', {
    title,
    version_id,
    status,
  });
  return response.feature;
}

export async function updateFeature(
  id: string,
  updates: { title?: string; status?: FeatureStatus; position?: number; version_id?: string }
): Promise<Feature> {
  const response = await api.put<FeatureResponse>(`/api/roadmap/features/${id}`, updates);
  return response.feature;
}

export async function deleteFeature(id: string): Promise<void> {
  await api.delete(`/api/roadmap/features/${id}`);
}

