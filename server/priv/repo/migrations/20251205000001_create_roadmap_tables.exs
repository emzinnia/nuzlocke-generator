defmodule NuzlockeApi.Repo.Migrations.CreateRoadmapTables do
  use Ecto.Migration

  def change do
    create table(:versions, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :name, :string, null: false
      add :position, :integer, null: false, default: 0

      timestamps(type: :utc_datetime)
    end

    create table(:features, primary_key: false) do
      add :id, :binary_id, primary_key: true
      add :title, :string, null: false
      add :status, :string, null: false, default: "planned"
      add :position, :integer, null: false, default: 0
      add :version_id, references(:versions, type: :binary_id, on_delete: :delete_all), null: false

      timestamps(type: :utc_datetime)
    end

    create index(:features, [:version_id])
    create index(:features, [:status])
  end
end
