defmodule NuzlockeApiWeb.Router do
  use NuzlockeApiWeb, :router

  pipeline :api do
    plug :accepts, ["json"]
  end

  pipeline :auth do
    plug NuzlockeApiWeb.AuthPipeline
  end

  pipeline :ensure_auth do
    plug NuzlockeApiWeb.EnsureAuth
  end

  # Public auth routes (no authentication required)
  scope "/api/auth", NuzlockeApiWeb do
    pipe_through [:api, :auth]

    post "/register", AuthController, :register
    post "/login", AuthController, :login
    get "/me", AuthController, :me
  end

  # Protected API routes (authentication required)
  scope "/api", NuzlockeApiWeb do
    pipe_through [:api, :auth, :ensure_auth]

    resources "/runs", RunController, except: [:new, :edit]
    post "/runs/:id/patch", RunController, :patch

    # Roadmap routes
    get "/roadmap", RoadmapController, :index
    post "/roadmap/versions", RoadmapController, :create_version
    put "/roadmap/versions/:id", RoadmapController, :update_version
    delete "/roadmap/versions/:id", RoadmapController, :delete_version
    post "/roadmap/features", RoadmapController, :create_feature
    put "/roadmap/features/:id", RoadmapController, :update_feature
    delete "/roadmap/features/:id", RoadmapController, :delete_feature
  end

  # Public API routes
  scope "/api", NuzlockeApiWeb do
    pipe_through :api

    get "/releases/:type", ReleaseController, :show
    post "/report", ReportController, :create
  end

  # Enable LiveDashboard and Swoosh mailbox preview in development
  if Application.compile_env(:nuzlocke_api, :dev_routes) do
    # If you want to use the LiveDashboard in production, you should put
    # it behind authentication and allow only admins to access it.
    # If your application does not have an admins-only section yet,
    # you can use Plug.BasicAuth to set up some basic authentication
    # as long as you are also using SSL (which you should anyway).
    import Phoenix.LiveDashboard.Router

    scope "/dev" do
      pipe_through [:fetch_session, :protect_from_forgery]

      live_dashboard "/dashboard", metrics: NuzlockeApiWeb.Telemetry
      forward "/mailbox", Plug.Swoosh.MailboxPreview
    end
  end
end
