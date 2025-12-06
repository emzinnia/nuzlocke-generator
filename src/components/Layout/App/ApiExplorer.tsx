import React, { useState } from "react";
import { getAuthToken } from "api/client";
import { Button } from "components/Common/ui/Button";

interface Endpoint {
  id: string;
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  description: string;
  category: "Auth" | "Runs" | "Public";
  hasBody?: boolean;
  pathParams?: string[];
  defaultBody?: Record<string, unknown>;
}

const ENDPOINTS: Endpoint[] = [
  // Auth endpoints
  {
    id: "auth-me",
    method: "GET",
    path: "/api/auth/me",
    description: "Get current authenticated user",
    category: "Auth",
  },
  // Run endpoints
  {
    id: "runs-list",
    method: "GET",
    path: "/api/runs",
    description: "List all runs for current user",
    category: "Runs",
  },
  {
    id: "runs-create",
    method: "POST",
    path: "/api/runs",
    description: "Create a new run",
    category: "Runs",
    hasBody: true,
    defaultBody: {
      name: "My Nuzlocke Run",
      data: {
        pokemon: [],
        trainer: { name: "Ash" },
      },
    },
  },
  {
    id: "runs-get",
    method: "GET",
    path: "/api/runs/:id",
    description: "Get a specific run by ID",
    category: "Runs",
    pathParams: ["id"],
  },
  {
    id: "runs-update",
    method: "PUT",
    path: "/api/runs/:id",
    description: "Update a run",
    category: "Runs",
    pathParams: ["id"],
    hasBody: true,
    defaultBody: {
      name: "Updated Run Name",
    },
  },
  {
    id: "runs-patch",
    method: "POST",
    path: "/api/runs/:id/patch",
    description: "Apply a patch to run data",
    category: "Runs",
    pathParams: ["id"],
    hasBody: true,
    defaultBody: {
      patch: {
        trainer: { name: "Red" },
      },
    },
  },
  {
    id: "runs-delete",
    method: "DELETE",
    path: "/api/runs/:id",
    description: "Delete a run",
    category: "Runs",
    pathParams: ["id"],
  },
  // Public endpoints
  {
    id: "releases-latest",
    method: "GET",
    path: "/api/releases/latest",
    description: "Get latest release notes",
    category: "Public",
  },
  {
    id: "releases-all",
    method: "GET",
    path: "/api/releases/all",
    description: "Get all release notes",
    category: "Public",
  },
  {
    id: "report",
    method: "POST",
    path: "/api/report",
    description: "Submit a bug report",
    category: "Public",
    hasBody: true,
    defaultBody: {
      title: "Test Bug Report",
      report: "This is a test report from API Explorer",
      data: null,
    },
  },
];

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

const METHOD_COLORS: Record<string, string> = {
  GET: "bg-emerald-500",
  POST: "bg-blue-500",
  PUT: "bg-amber-500",
  DELETE: "bg-red-500",
};

interface ApiResponse {
  status: number;
  statusText: string;
  data: unknown;
  duration: number;
}

export const ApiExplorer: React.FC = () => {
  const [selectedEndpoint, setSelectedEndpoint] = useState<Endpoint>(ENDPOINTS[0]);
  const [pathParams, setPathParams] = useState<Record<string, string>>({});
  const [requestBody, setRequestBody] = useState<string>("");
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEndpointChange = (endpointId: string) => {
    const endpoint = ENDPOINTS.find((e) => e.id === endpointId);
    if (endpoint) {
      setSelectedEndpoint(endpoint);
      setPathParams({});
      setRequestBody(
        endpoint.defaultBody ? JSON.stringify(endpoint.defaultBody, null, 2) : ""
      );
      setResponse(null);
      setError(null);
    }
  };

  const buildUrl = (): string => {
    let url = selectedEndpoint.path;
    if (selectedEndpoint.pathParams) {
      for (const param of selectedEndpoint.pathParams) {
        url = url.replace(`:${param}`, pathParams[param] || `:${param}`);
      }
    }
    return `${API_BASE_URL}${url}`;
  };

  const executeRequest = async () => {
    setIsLoading(true);
    setError(null);
    setResponse(null);

    const startTime = performance.now();

    try {
      const token = getAuthToken();
      const headers: HeadersInit = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const config: RequestInit = {
        method: selectedEndpoint.method,
        headers,
      };

      if (selectedEndpoint.hasBody && requestBody) {
        try {
          JSON.parse(requestBody); // Validate JSON
          config.body = requestBody;
        } catch {
          setError("Invalid JSON in request body");
          setIsLoading(false);
          return;
        }
      }

      const url = buildUrl();
      const res = await fetch(url, config);
      const duration = performance.now() - startTime;

      let data: unknown;
      const contentType = res.headers.get("content-type");
      if (contentType?.includes("application/json")) {
        data = await res.json();
      } else {
        data = await res.text();
      }

      setResponse({
        status: res.status,
        statusText: res.statusText,
        data,
        duration,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Request failed");
    } finally {
      setIsLoading(false);
    }
  };

  const groupedEndpoints = ENDPOINTS.reduce(
    (acc, endpoint) => {
      if (!acc[endpoint.category]) {
        acc[endpoint.category] = [];
      }
      acc[endpoint.category].push(endpoint);
      return acc;
    },
    {} as Record<string, Endpoint[]>
  );

  return (
    <div className="bg-slate-900 rounded-lg shadow-xl overflow-hidden font-mono text-sm">
      {/* Header */}
      <div className="bg-slate-800 px-4 py-3 border-b border-slate-700">
        <h2 className="text-lg font-semibold text-white flex items-center gap-2">
          <svg
            className="w-5 h-5 text-emerald-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          API Explorer
        </h2>
      </div>

      <div className="p-4 space-y-4">
        {/* Endpoint Selector */}
        <div>
          <label className="block text-slate-400 text-xs uppercase tracking-wide mb-2">
            Endpoint
          </label>
          <select
            value={selectedEndpoint.id}
            onChange={(e) => handleEndpointChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
          >
            {Object.entries(groupedEndpoints).map(([category, endpoints]) => (
              <optgroup key={category} label={category}>
                {endpoints.map((endpoint) => (
                  <option key={endpoint.id} value={endpoint.id}>
                    {endpoint.method} {endpoint.path} - {endpoint.description}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        {/* Request URL Display */}
        <div className="flex items-center gap-2 bg-slate-800 rounded-md p-3 border border-slate-700">
          <span
            className={`${METHOD_COLORS[selectedEndpoint.method]} text-white text-xs font-bold px-2 py-1 rounded`}
          >
            {selectedEndpoint.method}
          </span>
          <code className="text-slate-300 flex-1 overflow-x-auto">{buildUrl()}</code>
          <Button
            onClick={executeRequest}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white px-4 py-1.5 rounded-md font-sans font-medium transition-colors"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
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
                Sending...
              </span>
            ) : (
              "Send"
            )}
          </Button>
        </div>

        {/* Path Parameters */}
        {selectedEndpoint.pathParams && selectedEndpoint.pathParams.length > 0 && (
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wide mb-2">
              Path Parameters
            </label>
            <div className="space-y-2">
              {selectedEndpoint.pathParams.map((param) => (
                <div key={param} className="flex items-center gap-2">
                  <span className="text-amber-400 w-20">:{param}</span>
                  <input
                    type="text"
                    value={pathParams[param] || ""}
                    onChange={(e) =>
                      setPathParams({ ...pathParams, [param]: e.target.value })
                    }
                    placeholder={`Enter ${param}`}
                    className="flex-1 bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Request Body */}
        {selectedEndpoint.hasBody && (
          <div>
            <label className="block text-slate-400 text-xs uppercase tracking-wide mb-2">
              Request Body (JSON)
            </label>
            <textarea
              value={requestBody}
              onChange={(e) => setRequestBody(e.target.value)}
              rows={8}
              className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-2 text-emerald-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-y"
              placeholder='{"key": "value"}'
            />
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-900/50 border border-red-700 rounded-md p-3">
            <div className="flex items-center gap-2 text-red-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span className="font-sans font-medium">Error</span>
            </div>
            <p className="text-red-300 mt-1">{error}</p>
          </div>
        )}

        {/* Response Display */}
        {response && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-slate-400 text-xs uppercase tracking-wide">
                Response
              </label>
              <div className="flex items-center gap-3 text-xs">
                <span
                  className={`px-2 py-0.5 rounded ${
                    response.status >= 200 && response.status < 300
                      ? "bg-emerald-900 text-emerald-300"
                      : response.status >= 400
                        ? "bg-red-900 text-red-300"
                        : "bg-amber-900 text-amber-300"
                  }`}
                >
                  {response.status} {response.statusText}
                </span>
                <span className="text-slate-500">{response.duration.toFixed(0)}ms</span>
              </div>
            </div>
            <div className="bg-slate-800 border border-slate-700 rounded-md overflow-hidden">
              <pre className="p-3 text-slate-300 overflow-x-auto max-h-96 overflow-y-auto">
                <code>{JSON.stringify(response.data, null, 2)}</code>
              </pre>
            </div>
          </div>
        )}

        {/* Auth Token Status */}
        <div className="border-t border-slate-700 pt-4 mt-4">
          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500">Auth Token:</span>
            {getAuthToken() ? (
              <span className="flex items-center gap-1 text-emerald-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                Present
              </span>
            ) : (
              <span className="flex items-center gap-1 text-amber-400">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
                Not set (some endpoints will fail)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
