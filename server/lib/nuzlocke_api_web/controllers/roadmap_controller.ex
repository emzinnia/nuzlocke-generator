defmodule NuzlockeApiWeb.RoadmapController do
  use NuzlockeApiWeb, :controller

  alias NuzlockeApi.Roadmap

  action_fallback NuzlockeApiWeb.FallbackController

  @doc """
  GET /api/roadmap
  List all versions with their features.
  """
  def index(conn, _params) do
    versions = Roadmap.list_versions()

    conn
    |> json(%{
      versions:
        Enum.map(versions, fn version ->
          %{
            id: version.id,
            name: version.name,
            position: version.position,
            features:
              Enum.map(version.features, fn feature ->
                %{
                  id: feature.id,
                  title: feature.title,
                  status: feature.status,
                  position: feature.position,
                  version_id: feature.version_id
                }
              end),
            inserted_at: version.inserted_at,
            updated_at: version.updated_at
          }
        end)
    })
  end

  @doc """
  POST /api/roadmap/versions
  Create a new version.
  """
  def create_version(conn, params) do
    case Roadmap.create_version(params) do
      {:ok, version} ->
        conn
        |> put_status(:created)
        |> json(%{
          version: %{
            id: version.id,
            name: version.name,
            position: version.position,
            features: [],
            inserted_at: version.inserted_at,
            updated_at: version.updated_at
          }
        })

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  @doc """
  PUT /api/roadmap/versions/:id
  Update a version.
  """
  def update_version(conn, %{"id" => id} = params) do
    case Roadmap.get_version(id) do
      nil ->
        {:error, :not_found}

      version ->
        case Roadmap.update_version(version, params) do
          {:ok, updated_version} ->
            conn
            |> json(%{
              version: %{
                id: updated_version.id,
                name: updated_version.name,
                position: updated_version.position,
                inserted_at: updated_version.inserted_at,
                updated_at: updated_version.updated_at
              }
            })

          {:error, changeset} ->
            {:error, changeset}
        end
    end
  end

  @doc """
  DELETE /api/roadmap/versions/:id
  Delete a version.
  """
  def delete_version(conn, %{"id" => id}) do
    case Roadmap.get_version(id) do
      nil ->
        {:error, :not_found}

      version ->
        case Roadmap.delete_version(version) do
          {:ok, _version} ->
            conn
            |> send_resp(:no_content, "")

          {:error, _changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{error: "Could not delete version"})
        end
    end
  end

  @doc """
  POST /api/roadmap/features
  Create a new feature.
  """
  def create_feature(conn, params) do
    case Roadmap.create_feature(params) do
      {:ok, feature} ->
        conn
        |> put_status(:created)
        |> json(%{
          feature: %{
            id: feature.id,
            title: feature.title,
            status: feature.status,
            position: feature.position,
            version_id: feature.version_id,
            inserted_at: feature.inserted_at,
            updated_at: feature.updated_at
          }
        })

      {:error, changeset} ->
        {:error, changeset}
    end
  end

  @doc """
  PUT /api/roadmap/features/:id
  Update a feature (including status changes for drag-drop).
  """
  def update_feature(conn, %{"id" => id} = params) do
    case Roadmap.get_feature(id) do
      nil ->
        {:error, :not_found}

      feature ->
        case Roadmap.update_feature(feature, params) do
          {:ok, updated_feature} ->
            conn
            |> json(%{
              feature: %{
                id: updated_feature.id,
                title: updated_feature.title,
                status: updated_feature.status,
                position: updated_feature.position,
                version_id: updated_feature.version_id,
                inserted_at: updated_feature.inserted_at,
                updated_at: updated_feature.updated_at
              }
            })

          {:error, changeset} ->
            {:error, changeset}
        end
    end
  end

  @doc """
  DELETE /api/roadmap/features/:id
  Delete a feature.
  """
  def delete_feature(conn, %{"id" => id}) do
    case Roadmap.get_feature(id) do
      nil ->
        {:error, :not_found}

      feature ->
        case Roadmap.delete_feature(feature) do
          {:ok, _feature} ->
            conn
            |> send_resp(:no_content, "")

          {:error, _changeset} ->
            conn
            |> put_status(:unprocessable_entity)
            |> json(%{error: "Could not delete feature"})
        end
    end
  end
end
