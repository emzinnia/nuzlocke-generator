defmodule NuzlockeApi.Repo.Migrations.AddIsAnonymousToUsers do
  use Ecto.Migration

  def change do
    alter table(:users) do
      add :is_anonymous, :boolean, default: false, null: false
      modify :email, :string, null: true
      modify :password_hash, :string, null: true
    end
  end
end
