defmodule NuzlockeApi.Roadmap do
  @moduledoc """
  The Roadmap context.
  """

  import Ecto.Query, warn: false
  alias NuzlockeApi.Repo
  alias NuzlockeApi.Roadmap.{Version, Feature}

  # Version functions

  def list_versions do
    Version
    |> order_by(:position)
    |> preload(:features)
    |> Repo.all()
  end

  def get_version(id), do: Repo.get(Version, id)

  def get_version_with_features(id) do
    Version
    |> preload(:features)
    |> Repo.get(id)
  end

  def create_version(attrs \\ %{}) do
    position = get_next_version_position()

    %Version{}
    |> Version.changeset(Map.put(attrs, "position", position))
    |> Repo.insert()
  end

  def update_version(%Version{} = version, attrs) do
    version
    |> Version.changeset(attrs)
    |> Repo.update()
  end

  def delete_version(%Version{} = version) do
    Repo.delete(version)
  end

  defp get_next_version_position do
    case Repo.one(from v in Version, select: max(v.position)) do
      nil -> 0
      max -> max + 1
    end
  end

  # Feature functions

  def list_features do
    Feature
    |> order_by(:position)
    |> Repo.all()
  end

  def list_features_for_version(version_id) do
    Feature
    |> where(version_id: ^version_id)
    |> order_by(:position)
    |> Repo.all()
  end

  def get_feature(id), do: Repo.get(Feature, id)

  def create_feature(attrs \\ %{}) do
    position = get_next_feature_position(attrs["version_id"], attrs["status"] || "planned")

    %Feature{}
    |> Feature.changeset(Map.put(attrs, "position", position))
    |> Repo.insert()
  end

  def update_feature(%Feature{} = feature, attrs) do
    feature
    |> Feature.changeset(attrs)
    |> Repo.update()
  end

  def delete_feature(%Feature{} = feature) do
    Repo.delete(feature)
  end

  defp get_next_feature_position(version_id, status) do
    query =
      from f in Feature,
        where: f.version_id == ^version_id and f.status == ^status,
        select: max(f.position)

    case Repo.one(query) do
      nil -> 0
      max -> max + 1
    end
  end
end
