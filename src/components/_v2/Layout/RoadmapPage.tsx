import * as React from 'react';
import {
  getRoadmap,
  createVersion,
  updateVersion,
  deleteVersion,
  createFeature,
  updateFeature,
  deleteFeature,
  type Version,
  type Feature,
  type FeatureStatus,
} from 'api/roadmap';
import { Button } from 'components/Common/ui/Button';

const STATUS_COLUMNS: { status: FeatureStatus; label: string; color: string }[] = [
  { status: 'planned', label: 'Planned', color: 'bg-slate-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-amber-500' },
  { status: 'done', label: 'Done', color: 'bg-emerald-500' },
];

interface FeatureCardProps {
  feature: Feature;
  onUpdate: (id: string, updates: Partial<Feature>) => void;
  onDelete: (id: string) => void;
  onDragStart: (e: React.DragEvent, feature: Feature) => void;
}

function FeatureCard({ feature, onUpdate, onDelete, onDragStart }: FeatureCardProps) {
  const [isEditing, setIsEditing] = React.useState(false);
  const [title, setTitle] = React.useState(feature.title);

  const handleSave = () => {
    if (title.trim() && title !== feature.title) {
      onUpdate(feature.id, { title: title.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setTitle(feature.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, feature)}
      className="group bg-white dark:bg-gray-700 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-600 cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
    >
      {isEditing ? (
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          autoFocus
          className="w-full px-2 py-1 text-sm bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-500 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white"
        />
      ) : (
        <div className="flex items-start justify-between gap-2">
          <span
            className="text-sm text-gray-800 dark:text-gray-200 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
            onClick={() => setIsEditing(true)}
          >
            {feature.title}
          </span>
          <Button
            onClick={() => onDelete(feature.id)}
            variant="icon"
            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity"
            title="Delete feature"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      )}
    </div>
  );
}

interface KanbanColumnProps {
  status: FeatureStatus;
  label: string;
  color: string;
  features: Feature[];
  versionId: string;
  onUpdateFeature: (id: string, updates: Partial<Feature>) => void;
  onDeleteFeature: (id: string) => void;
  onCreateFeature: (title: string, status: FeatureStatus) => void;
  onDragStart: (e: React.DragEvent, feature: Feature) => void;
  onDrop: (e: React.DragEvent, status: FeatureStatus) => void;
}

function KanbanColumn({
  status,
  label,
  color,
  features,
  onUpdateFeature,
  onDeleteFeature,
  onCreateFeature,
  onDragStart,
  onDrop,
}: KanbanColumnProps) {
  const [isAdding, setIsAdding] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState('');
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleAdd = () => {
    if (newTitle.trim()) {
      onCreateFeature(newTitle.trim(), status);
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAdd();
    } else if (e.key === 'Escape') {
      setNewTitle('');
      setIsAdding(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(e, status);
  };

  return (
    <div
      className={`flex-1 min-w-[280px] max-w-[360px] bg-gray-100 dark:bg-gray-800 rounded-xl p-4 transition-colors ${
        isDragOver ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-900' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="flex items-center gap-2 mb-4">
        <div className={`w-3 h-3 rounded-full ${color}`} />
        <h3 className="font-semibold text-gray-700 dark:text-gray-300">{label}</h3>
        <span className="ml-auto text-sm text-gray-500 dark:text-gray-400 bg-gray-200 dark:bg-gray-700 px-2 py-0.5 rounded-full">
          {features.length}
        </span>
      </div>

      <div className="space-y-2 min-h-[100px]">
        {features
          .sort((a, b) => a.position - b.position)
          .map((feature) => (
            <FeatureCard
              key={feature.id}
              feature={feature}
              onUpdate={onUpdateFeature}
              onDelete={onDeleteFeature}
              onDragStart={onDragStart}
            />
          ))}
      </div>

      {isAdding ? (
        <div className="mt-3">
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onBlur={() => {
              if (!newTitle.trim()) setIsAdding(false);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Feature title..."
            autoFocus
            className="w-full px-3 py-2 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <div className="flex gap-2 mt-2">
            <Button
              onClick={handleAdd}
              className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Add
            </Button>
            <Button
              onClick={() => {
                setNewTitle('');
                setIsAdding(false);
              }}
              variant="ghost"
              className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
            >
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsAdding(true)}
          variant="ghost"
          className="mt-3 w-full py-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors flex items-center justify-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add feature
        </Button>
      )}
    </div>
  );
}

interface VersionSelectorProps {
  versions: Version[];
  selectedVersion: Version | null;
  onSelect: (version: Version) => void;
  onCreate: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}

function VersionSelector({
  versions,
  selectedVersion,
  onSelect,
  onCreate,
  onUpdate,
  onDelete,
}: VersionSelectorProps) {
  const [isCreating, setIsCreating] = React.useState(false);
  const [newName, setNewName] = React.useState('');
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editName, setEditName] = React.useState('');

  const handleCreate = () => {
    if (newName.trim()) {
      onCreate(newName.trim());
      setNewName('');
      setIsCreating(false);
    }
  };

  const handleStartEdit = (version: Version) => {
    setEditingId(version.id);
    setEditName(version.name);
  };

  const handleSaveEdit = () => {
    if (editingId && editName.trim()) {
      onUpdate(editingId, editName.trim());
    }
    setEditingId(null);
    setEditName('');
  };

  return (
    <div className="flex flex-wrap items-center gap-2 mb-6">
      {versions.map((version) => (
        <div key={version.id} className="flex items-center">
          {editingId === version.id ? (
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onBlur={handleSaveEdit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSaveEdit();
                if (e.key === 'Escape') {
                  setEditingId(null);
                  setEditName('');
                }
              }}
              autoFocus
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-blue-500 rounded-lg focus:outline-none text-gray-900 dark:text-white"
            />
          ) : (
            <Button
              onClick={() => onSelect(version)}
              onDoubleClick={() => handleStartEdit(version)}
              className={`px-4 py-1.5 text-sm rounded-lg transition-colors ${
                selectedVersion?.id === version.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
              }`}
            >
              {version.name}
            </Button>
          )}
          {selectedVersion?.id === version.id && versions.length > 1 && (
            <Button
              onClick={() => onDelete(version.id)}
              variant="icon"
              className="ml-1 p-1 text-gray-400 hover:text-red-500 transition-colors"
              title="Delete version"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          )}
        </div>
      ))}

      {isCreating ? (
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleCreate();
              if (e.key === 'Escape') {
                setNewName('');
                setIsCreating(false);
              }
            }}
            placeholder="Version name..."
            autoFocus
            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 dark:text-white placeholder-gray-500"
          />
          <Button
            onClick={handleCreate}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            Add
          </Button>
          <Button
            onClick={() => {
              setNewName('');
              setIsCreating(false);
            }}
            variant="ghost"
            className="px-3 py-1.5 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            Cancel
          </Button>
        </div>
      ) : (
        <Button
          onClick={() => setIsCreating(true)}
          variant="ghost"
          className="px-3 py-1.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Version
        </Button>
      )}
    </div>
  );
}

export function RoadmapPage() {
  const [versions, setVersions] = React.useState<Version[]>([]);
  const [selectedVersion, setSelectedVersion] = React.useState<Version | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [draggedFeature, setDraggedFeature] = React.useState<Feature | null>(null);

  const loadRoadmap = React.useCallback(async () => {
    try {
      const data = await getRoadmap();
      setVersions(data);
      if (data.length > 0 && !selectedVersion) {
        setSelectedVersion(data[0]);
      } else if (selectedVersion) {
        const updated = data.find((v) => v.id === selectedVersion.id);
        setSelectedVersion(updated || data[0] || null);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load roadmap');
    } finally {
      setLoading(false);
    }
  }, [selectedVersion]);

  React.useEffect(() => {
    loadRoadmap();
  }, []);

  const handleCreateVersion = async (name: string) => {
    try {
      const newVersion = await createVersion(name);
      setVersions((prev) => [...prev, newVersion]);
      setSelectedVersion(newVersion);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create version');
    }
  };

  const handleUpdateVersion = async (id: string, name: string) => {
    try {
      const updated = await updateVersion(id, { name });
      setVersions((prev) => prev.map((v) => (v.id === id ? { ...v, name: updated.name } : v)));
      if (selectedVersion?.id === id) {
        setSelectedVersion((prev) => (prev ? { ...prev, name: updated.name } : prev));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update version');
    }
  };

  const handleDeleteVersion = async (id: string) => {
    try {
      await deleteVersion(id);
      setVersions((prev) => {
        const remaining = prev.filter((v) => v.id !== id);
        if (selectedVersion?.id === id) {
          setSelectedVersion(remaining[0] || null);
        }
        return remaining;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete version');
    }
  };

  const handleCreateFeature = async (title: string, status: FeatureStatus) => {
    if (!selectedVersion) return;
    try {
      const newFeature = await createFeature(title, selectedVersion.id, status);
      setVersions((prev) =>
        prev.map((v) =>
          v.id === selectedVersion.id ? { ...v, features: [...v.features, newFeature] } : v
        )
      );
      setSelectedVersion((prev) =>
        prev ? { ...prev, features: [...prev.features, newFeature] } : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feature');
    }
  };

  const handleUpdateFeature = async (id: string, updates: Partial<Feature>) => {
    try {
      const updated = await updateFeature(id, updates);
      const updateFeatures = (features: Feature[]) =>
        features.map((f) => (f.id === id ? { ...f, ...updated } : f));

      setVersions((prev) =>
        prev.map((v) => ({
          ...v,
          features: updateFeatures(v.features),
        }))
      );
      setSelectedVersion((prev) =>
        prev ? { ...prev, features: updateFeatures(prev.features) } : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature');
    }
  };

  const handleDeleteFeature = async (id: string) => {
    try {
      await deleteFeature(id);
      const filterFeatures = (features: Feature[]) => features.filter((f) => f.id !== id);

      setVersions((prev) =>
        prev.map((v) => ({
          ...v,
          features: filterFeatures(v.features),
        }))
      );
      setSelectedVersion((prev) =>
        prev ? { ...prev, features: filterFeatures(prev.features) } : prev
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feature');
    }
  };

  const handleDragStart = (e: React.DragEvent, feature: Feature) => {
    setDraggedFeature(feature);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDrop = async (_e: React.DragEvent, status: FeatureStatus) => {
    if (!draggedFeature || draggedFeature.status === status) {
      setDraggedFeature(null);
      return;
    }

    await handleUpdateFeature(draggedFeature.id, { status });
    setDraggedFeature(null);
  };

  if (loading) {
    return (
      <div className="p-6 flex items-center gap-2 text-gray-500 dark:text-gray-400">
        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
            fill="none"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
        Loading roadmap...
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">Roadmap</h1>

      {error && (
        <div className="mb-4 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center justify-between">
          <span>{error}</span>
          <Button onClick={() => setError(null)} variant="ghost" className="text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>
      )}

      <VersionSelector
        versions={versions}
        selectedVersion={selectedVersion}
        onSelect={setSelectedVersion}
        onCreate={handleCreateVersion}
        onUpdate={handleUpdateVersion}
        onDelete={handleDeleteVersion}
      />

      {selectedVersion ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STATUS_COLUMNS.map(({ status, label, color }) => (
            <KanbanColumn
              key={status}
              status={status}
              label={label}
              color={color}
              features={selectedVersion.features.filter((f) => f.status === status)}
              versionId={selectedVersion.id}
              onUpdateFeature={handleUpdateFeature}
              onDeleteFeature={handleDeleteFeature}
              onCreateFeature={handleCreateFeature}
              onDragStart={handleDragStart}
              onDrop={handleDrop}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p className="text-lg mb-4">No versions yet</p>
          <p>Create a version to start planning your roadmap</p>
        </div>
      )}
    </div>
  );
}

