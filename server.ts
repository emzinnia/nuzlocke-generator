import head from "lodash/head";
import tail from "lodash/tail";
import express from "express";
import path, { dirname } from "node:path";
import * as dotenv from "dotenv";
import fetch from "node-fetch";
import compression from "compression";
import cors from "cors";
import pino from "pino";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();

const app = express();
const logger = pino({});

const isLocal = process.env.NODE_ENV === "local";

let middleware, compiler;

const GH_URL = "https://api.github.com/repos/emzinnia/nuzlocke-generator";
const GH_ACCESS_TOKEN = process.env.GH_ACCESS_TOKEN;
const productionFlag = process.env.NODE_ENV === "production";

app.use(express.json({ limit: "50mb" }));
app.use(cors());
app.use(compression());
if (isLocal && middleware && compiler) {
    logger.info(`Running server in development mode.`);
    app.use(middleware(compiler, {}));
} else {
    logger.info(`Running server in production mode.`);
}

interface ReportArgs {
    title?: string;
    report?: string;
    data?: string;
}

const PORT = process.env.PORT || 8080;

app.get("/", async (req, res, next) => {
    app.use(express.static(path.join(__dirname, "dist")));
    next();
});

const GITHUB_BODY_LIMIT = 65535;
const RESERVED_OVERHEAD = 500;
const MAX_DATA_SIZE = GITHUB_BODY_LIMIT - RESERVED_OVERHEAD;

function truncateNuzlockeData(jsonString: string, maxSize: number): { data: string; wasTruncated: boolean } {
    if (jsonString.length <= maxSize) {
        return { data: jsonString, wasTruncated: false };
    }

    let parsed: Record<string, unknown>;
    try {
        parsed = JSON.parse(jsonString);
    } catch {
        return {
            data: jsonString.slice(0, maxSize - 100) + '\n... [TRUNCATED - invalid JSON]',
            wasTruncated: true,
        };
    }

    const originalSize = jsonString.length;
    const truncationNotes: string[] = [];

    const fieldsToRemove = ['editorHistory', '_persist', 'sawRelease'];
    for (const field of fieldsToRemove) {
        if (field in parsed) {
            delete parsed[field];
            truncationNotes.push(`removed ${field}`);
        }
    }

    if (parsed.nuzlockes && Array.isArray((parsed.nuzlockes as Record<string, unknown>).saves)) {
        const saves = (parsed.nuzlockes as Record<string, unknown>).saves as unknown[];
        if (saves.length > 0) {
            (parsed.nuzlockes as Record<string, unknown>).saves = [];
            truncationNotes.push(`removed ${saves.length} other saves`);
        }
    }

    if (parsed.trainer && typeof parsed.trainer === 'object') {
        const trainer = parsed.trainer as Record<string, unknown>;
        if (typeof trainer.image === 'string' && trainer.image.length > 200) {
            trainer.image = '[BASE64_IMAGE_TRUNCATED]';
            truncationNotes.push('truncated trainer image');
        }
    }

    if (parsed.theme && typeof parsed.theme === 'object') {
        const theme = parsed.theme as Record<string, unknown>;
        if (typeof theme.customCSS === 'string' && theme.customCSS.length > 1000) {
            theme.customCSS = (theme.customCSS as string).slice(0, 500) + '\n/* ... [TRUNCATED] */';
            truncationNotes.push('truncated customCSS');
        }
    }

    let result = JSON.stringify(parsed, null, 2);
    if (result.length <= maxSize) {
        return { 
            data: result + (truncationNotes.length > 0 ? `\n\n// Truncation applied: ${truncationNotes.join(', ')}` : ''),
            wasTruncated: truncationNotes.length > 0,
        };
    }

    if (parsed.pokemon && Array.isArray(parsed.pokemon)) {
        const pokemon = parsed.pokemon as unknown[];
        const originalCount = pokemon.length;
        if (originalCount > 20) {
            const sample = [
                ...pokemon.slice(0, 10),
                { _note: `... ${originalCount - 15} pokemon omitted ...` },
                ...pokemon.slice(-5),
            ];
            parsed.pokemon = sample;
            truncationNotes.push(`truncated pokemon array from ${originalCount} to 15 samples`);
        }
    }

    result = JSON.stringify(parsed, null, 2);
    if (result.length <= maxSize) {
        return { 
            data: result + `\n\n// Truncation applied: ${truncationNotes.join(', ')}`,
            wasTruncated: true,
        };
    }

    if (parsed.pokemon && Array.isArray(parsed.pokemon)) {
        for (const poke of parsed.pokemon as Record<string, unknown>[]) {
            if (typeof poke.notes === 'string' && poke.notes.length > 100) {
                poke.notes = (poke.notes as string).slice(0, 100) + '...';
            }
            if (typeof poke.extraData === 'string' && poke.extraData.length > 200) {
                poke.extraData = '[TRUNCATED]';
            }
        }
        truncationNotes.push('truncated pokemon notes/extraData');
    }

    result = JSON.stringify(parsed, null, 2);
    if (result.length <= maxSize) {
        return { 
            data: result + `\n\n// Truncation applied: ${truncationNotes.join(', ')}`,
            wasTruncated: true,
        };
    }

    if (parsed.pokemon && Array.isArray(parsed.pokemon)) {
        const pokemon = parsed.pokemon as unknown[];
        const originalCount = pokemon.length;
        if (originalCount > 5) {
            parsed.pokemon = [
                ...pokemon.slice(0, 5),
                { _note: `... ${originalCount - 5} more pokemon omitted ...` },
            ];
            truncationNotes.push(`aggressively truncated pokemon to 5`);
        }
    }

    result = JSON.stringify(parsed, null, 2);
    if (result.length <= maxSize) {
        return { 
            data: result + `\n\n// Truncation applied: ${truncationNotes.join(', ')}`,
            wasTruncated: true,
        };
    }

    result = JSON.stringify(parsed);
    if (result.length <= maxSize) {
        return { 
            data: result + `\n// Truncation: ${truncationNotes.join(', ')} + compact format`,
            wasTruncated: true,
        };
    }

    const hardTruncateSize = maxSize - 200;
    return {
        data: result.slice(0, hardTruncateSize) + 
            `\n\n... [HARD TRUNCATED from ${originalSize} to ${hardTruncateSize} chars]\n` +
            `// Original size: ${Math.round(originalSize / 1024)}KB, Limit: ${Math.round(maxSize / 1024)}KB\n` +
            `// Truncation applied: ${truncationNotes.join(', ')}`,
        wasTruncated: true,
    };
}

app.post("/report", async (req, res, next) => {
    const { report, title, data } = req.body as ReportArgs;
    logger.info({ title, hasData: !!data, dataLength: data?.length ?? 0 }, "Received bug report");

    if (!title) {
        logger.warn("Bug report submitted without title");
        res.status(400).send({ status: 400, error: "Missing report title." });
        return;
    }

    const reportText = report ?? "";
    const codeBlockOverhead = "\n \n```json\n\n```\n        ".length;
    const availableForData = MAX_DATA_SIZE - reportText.length - codeBlockOverhead;

    let processedData: string;
    let wasTruncated = false;

    if (!data) {
        processedData = "User chose not to attach nuzlocke.json";
    } else if (data.length <= availableForData) {
        processedData = data;
    } else {
        logger.info(
            { originalSize: data.length, availableSpace: availableForData },
            "Attempting to truncate large nuzlocke.json"
        );
        const truncateResult = truncateNuzlockeData(data, availableForData);
        processedData = truncateResult.data;
        wasTruncated = truncateResult.wasTruncated;

        if (wasTruncated) {
            logger.info(
                { originalSize: data.length, truncatedSize: processedData.length },
                "Successfully truncated nuzlocke.json"
            );
        }
    }

    const truncationNotice = wasTruncated 
        ? "\n\n⚠️ **Note:** The attached nuzlocke.json was automatically truncated to fit GitHub's size limits.\n"
        : "";
    
    const issueBody = `${reportText}${truncationNotice}
 
\`\`\`json
${processedData}
\`\`\`
        `;

    if (issueBody.length > GITHUB_BODY_LIMIT) {
        logger.error(
            { bodyLength: issueBody.length, limit: GITHUB_BODY_LIMIT },
            "Bug report body still exceeds limit after truncation"
        );
        res.status(413).send({
            status: 413,
            error: "BODY_TOO_LARGE",
            message: `Unable to fit the report within GitHub's limits. Please try unchecking "include nuzlocke.json file".`,
        });
        return;
    }

    try {
        const githubCall = await fetch(`${GH_URL}/issues`, {
            method: "POST",
            headers: {
                Accept: "application/vnd.github.v3+json",
                Authorization: `Token ${process.env.GH_ACCESS_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                title: title,
                body: issueBody,
                assignees: ["emzinnia"],
                labels: ["User Submitted", "Type: Bug"],
            }),
        });

        if (githubCall?.status?.toString()[0] === "2") {
            logger.info({ status: githubCall.status }, "Successfully created GitHub issue");
            res.send({ status: githubCall.status });
        } else {
            const errorBody = await githubCall.text();
            logger.error(
                { status: githubCall.status, error: errorBody, bodyLength: issueBody.length },
                "GitHub API returned error"
            );
            
            if (githubCall.status === 422) {
                res.status(422).send({
                    status: 422,
                    error: "GITHUB_VALIDATION_ERROR",
                    message: "GitHub rejected the issue. The attached data may be too large or contain invalid content.",
                });
            } else {
                res.status(githubCall.status).send({
                    status: githubCall.status,
                    error: "GITHUB_API_ERROR",
                    message: "Failed to create GitHub issue. Please try again later.",
                });
            }
        }
    } catch (error) {
        logger.error({ error: error instanceof Error ? error.message : error }, "Failed to call GitHub API");
        res.status(500).send({
            status: 500,
            error: "SERVER_ERROR",
            message: "An unexpected error occurred. Please try again later.",
        });
    }
});

app.get("/release/:type", async (req, res, next) => {
    const type = req.params.type;

    const releases = await fetch(`${GH_URL}/releases`, {
        method: "GET",
        headers: {
            Accept: "application/vnd.github.v3+json",
            Authorization: `Token ${process.env.GH_ACCESS_TOKEN}`,
            "Content-Type": "application/json",
        },
    })
        .then((res) => res.json())
        .then((res) => {
            if (Array.isArray(res)) {
                return res.map((rel) => ({
                    id: rel.id,
                    url: rel.html_url,
                    version: rel.tag_name,
                    note: rel.body,
                    timestamp: rel.published_at,
                }));
            } else {
                return [];
            }
        });

    if (type === "latest") {
        const notes = head(releases);
        res.send({ status: 200, payload: { notes: [notes] } });
    } else if (type === "all") {
        const notes = tail(releases);
        res.send({ status: 200, payload: { notes } });
    } else {
        logger.error(`Invalid release type param`);

        res.send({ status: 400, error: `Invalid release type param` });
    }
    next();
});

app.get("/nuzlocke/:id", async (req, res, next) => {
    logger.info("Retrieving nuzlocke ", req.params.id);
    res.send({ status: 200 });
    next();
});

app.post("/nuzlocke", async (req, res, next) => {});

app.get("/nuzlockes", async (req, res, next) => {});

app.listen(PORT, () => {
    logger.info(`Current environment: ${process.env.NODE_ENV}`);
    logger.info(`Running server on http://localhost:${PORT} 🚀`);
});
