import type { IncomingMessage, ServerResponse } from "node:http";
import app from "../server.js";

export default function handler(req: IncomingMessage, res: ServerResponse) {
    return app(req, res);
}
