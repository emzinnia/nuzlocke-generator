import { IncomingMessage, ServerResponse } from "node:http";
import { Socket } from "node:net";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import type { Express } from "express";

const fetchMock = vi.hoisted(() => vi.fn());

vi.mock("node-fetch", () => ({
    default: fetchMock,
}));

let app: Express;
const originalVercel = process.env.VERCEL;

const dispatch = async (
    method: "GET" | "POST",
    url: string,
    body?: unknown,
): Promise<{ body: unknown; status: number }> => {
    const socket = new Socket();
    const req = new IncomingMessage(socket);
    req.method = method;
    req.url = url;
    req.headers = {};

    if (body !== undefined) {
        const payload = JSON.stringify(body);
        req.headers["content-type"] = "application/json";
        req.headers["content-length"] = Buffer.byteLength(payload).toString();
        req.push(payload);
    }
    req.push(null);

    const res = new ServerResponse(req);
    const chunks: Buffer[] = [];

    return await new Promise((resolve, reject) => {
        res.assignSocket(socket);

        res.write = (
            chunk: string | Buffer | Uint8Array,
            encodingOrCallback?: BufferEncoding | ((error?: Error | null) => void),
            callback?: (error?: Error | null) => void,
        ) => {
            chunks.push(Buffer.from(chunk));
            if (typeof encodingOrCallback === "function") {
                encodingOrCallback();
            }
            if (callback) {
                callback();
            }
            return true;
        };

        res.end = (
            chunk?: string | Buffer | Uint8Array,
            encodingOrCallback?: BufferEncoding | (() => void),
            callback?: () => void,
        ) => {
            if (chunk) {
                chunks.push(Buffer.from(chunk));
            }
            if (typeof encodingOrCallback === "function") {
                encodingOrCallback();
            }
            if (callback) {
                callback();
            }

            const text = Buffer.concat(chunks).toString("utf8");
            resolve({
                status: res.statusCode,
                body: text ? JSON.parse(text) : undefined,
            });
            return res;
        };

        app.handle(req, res, reject);
    });
};

describe("server routes", () => {
    beforeAll(async () => {
        process.env.VERCEL = "1";
        app = (await import("../server")).default;
    });

    beforeEach(() => {
        fetchMock.mockReset();
    });

    afterAll(() => {
        if (originalVercel === undefined) {
            delete process.env.VERCEL;
        } else {
            process.env.VERCEL = originalVercel;
        }
    });

    it("returns a 400 response when bug reports omit the title", async () => {
        const response = await dispatch("POST", "/report", {
            report: "broken import flow",
        });

        expect(response.body).toEqual({
            status: 400,
            error: "Missing report title.",
        });
        expect(response.status).toBe(400);
        expect(fetchMock).not.toHaveBeenCalled();
    });

    it("maps GitHub releases into latest release notes", async () => {
        fetchMock.mockResolvedValueOnce({
            json: async () => [
                {
                    id: 10,
                    html_url: "https://github.com/emzinnia/nuzlocke-generator/releases/tag/v2",
                    tag_name: "v2",
                    body: "latest notes",
                    published_at: "2026-05-01T00:00:00Z",
                },
                {
                    id: 9,
                    html_url: "https://github.com/emzinnia/nuzlocke-generator/releases/tag/v1",
                    tag_name: "v1",
                    body: "older notes",
                    published_at: "2026-04-01T00:00:00Z",
                },
            ],
        });

        const response = await dispatch("GET", "/release/latest");

        expect(response.body).toEqual({
            status: 200,
            payload: {
                notes: [
                    {
                        id: 10,
                        url: "https://github.com/emzinnia/nuzlocke-generator/releases/tag/v2",
                        version: "v2",
                        note: "latest notes",
                        timestamp: "2026-05-01T00:00:00Z",
                    },
                ],
            },
        });
        expect(response.status).toBe(200);
    });
});
