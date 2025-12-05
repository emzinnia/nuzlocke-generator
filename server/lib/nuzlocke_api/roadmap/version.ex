defmodule NuzlockeApi.Roadmap.Version do
  use Ecto.Schema
  import Ecto.Changeset

  @primary_key {:id, :binary_id, autogenerate: true}
  @foreign_key_type :binary_id
  schema "versions" do
    field :name, :string
    field :position, :integer, default: 0

    has_many :features, NuzlockeApi.Roadmap.Feature

    timestamps(type: :utc_datetime)
  end

  def changeset(version, attrs) do
    version
    |> cast(attrs, [:name, :position])
    |> validate_required([:name])
  end
end
