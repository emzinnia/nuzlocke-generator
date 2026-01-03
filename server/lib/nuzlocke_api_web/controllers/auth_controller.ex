defmodule NuzlockeApiWeb.AuthController do
  use NuzlockeApiWeb, :controller

  alias NuzlockeApi.Accounts
  alias NuzlockeApi.Guardian

  action_fallback NuzlockeApiWeb.FallbackController

  @doc """
  POST /api/auth/register
  Register a new user account.
  """
  def register(conn, %{"email" => _email, "password" => _password} = params) do
    case Accounts.register_user(params) do
      {:ok, user} ->
        {:ok, token, _claims} = Guardian.encode_and_sign(user)

        conn
        |> put_status(:created)
        |> json(%{
          user: %{id: user.id, email: user.email},
          token: token
        })

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_changeset_errors(changeset)})
    end
  end

  @doc """
  POST /api/auth/login
  Authenticate and receive a JWT token.
  """
  def login(conn, %{"email" => email, "password" => password}) do
    case Accounts.get_user_by_email_and_password(email, password) do
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Invalid email or password"})

      user ->
        {:ok, token, _claims} = Guardian.encode_and_sign(user)

        conn
        |> json(%{
          user: %{id: user.id, email: user.email},
          token: token
        })
    end
  end

  @doc """
  POST /api/auth/anonymous
  Create an anonymous user session without requiring signup.
  """
  def anonymous(conn, _params) do
    case Accounts.create_anonymous_user() do
      {:ok, user} ->
        {:ok, token, _claims} = Guardian.encode_and_sign(user)

        conn
        |> put_status(:created)
        |> json(%{
          user: %{id: user.id, email: nil, is_anonymous: true},
          token: token
        })

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_changeset_errors(changeset)})
    end
  end

  @doc """
  GET /api/auth/me
  Get the current authenticated user.
  """
  def me(conn, _params) do
    user = Guardian.Plug.current_resource(conn)

    case user do
      nil ->
        conn
        |> put_status(:unauthorized)
        |> json(%{error: "Not authenticated"})

      user ->
        conn
        |> json(%{
          user: %{
            id: user.id,
            email: user.email,
            is_anonymous: user.is_anonymous
          }
        })
    end
  end

  @doc """
  POST /api/auth/upgrade
  Upgrade an anonymous account to a full account with email and password.
  """
  def upgrade(conn, %{"email" => email, "password" => password}) do
    user = Guardian.Plug.current_resource(conn)

    case Accounts.upgrade_anonymous_user(user, email, password) do
      {:ok, upgraded_user} ->
        {:ok, token, _claims} = Guardian.encode_and_sign(upgraded_user)

        conn
        |> json(%{
          user: %{id: upgraded_user.id, email: upgraded_user.email, is_anonymous: false},
          token: token
        })

      {:error, :not_anonymous} ->
        conn
        |> put_status(:bad_request)
        |> json(%{error: "Account is not anonymous"})

      {:error, changeset} ->
        conn
        |> put_status(:unprocessable_entity)
        |> json(%{errors: format_changeset_errors(changeset)})
    end
  end

  defp format_changeset_errors(changeset) do
    Ecto.Changeset.traverse_errors(changeset, fn {msg, opts} ->
      Regex.replace(~r"%{(\w+)}", msg, fn _, key ->
        opts |> Keyword.get(String.to_existing_atom(key), key) |> to_string()
      end)
    end)
  end
end
