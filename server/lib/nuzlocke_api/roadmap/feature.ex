defmodule NuzlockeApi.Roadmap.Feature do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "features" do
    field :title, :string
    field :status, :string, default: "planned"
    field :position, :integer, default: 0

    belongs_to :version, NuzlockeApi.Roadmap.Version

    timestamps(type: :utc_datetime)
  end

  def changeset(feature, attrs) do
    feature
    |> cast(attrs, [:title, :status, :position, :version_id])
    |> validate_required([:title, :version_id])
    |> validate_inclusion(:status, ["planned", "in_progress", "done"])
    |> foreign_key_constraint(:version_id)
  end
end
