defmodule NuzlockeApi.Accounts do
  @moduledoc """
  The Accounts context.
  """

  import Ecto.Query, warn: false
  alias NuzlockeApi.Repo
  alias NuzlockeApi.Accounts.User

  @doc """
  Gets a user by id.
  """
  def get_user(id), do: Repo.get(User, id)

  @doc """
  Gets a user by email.
  """
  def get_user_by_email(email) when is_binary(email) do
    Repo.get_by(User, email: email)
  end

  @doc """
  Gets a user by email and password.
  Returns nil if the user does not exist or the password is invalid.
  """
  def get_user_by_email_and_password(email, password)
      when is_binary(email) and is_binary(password) do
    user = get_user_by_email(email)
    if User.valid_password?(user, password), do: user
  end

  @doc """
  Registers a user.
  """
  def register_user(attrs) do
    %User{}
    |> User.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Creates an anonymous user.
  Anonymous users have no email or password and can use the app without signing up.
  """
  def create_anonymous_user do
    %User{}
    |> User.anonymous_changeset()
    |> Repo.insert()
  end

  @doc """
  Upgrades an anonymous user to a full account by setting email and password.
  """
  def upgrade_anonymous_user(%User{is_anonymous: true} = user, email, password) do
    user
    |> User.upgrade_changeset(%{email: email, password: password})
    |> Repo.update()
  end

  def upgrade_anonymous_user(%User{is_anonymous: false}, _email, _password) do
    {:error, :not_anonymous}
  end
end
