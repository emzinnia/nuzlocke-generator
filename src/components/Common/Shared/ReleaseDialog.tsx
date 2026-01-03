/// <reference types="vite/client" />
import * as React from "react";
import { Dialog, Button, Icon, Spinner } from "components/ui";
import { css, cx } from "emotion";
import * as styles from "components/Features/Result/styles";
import { Styles, classWithDarkTheme, getPatchlessVersion } from "utils";
import ReactMarkdown from "react-markdown";
import useSwr from "swr";

const GITHUB_REPO = "EmmaRamirez/nuzlocke-generator";
const GITHUB_RELEASES_URL = `https://api.github.com/repos/${GITHUB_REPO}/releases`;

const calyrex = "/icons/pokemon/regular/calyrex.png";
const croagunk = "/assets/img/croagunk.gif";
const dugtrio = "/icons/pokemon/regular/dugtrio.png";
const kubfu = "/icons/pokemon/regular/kubfu.png";
const lapras = "/icons/pokemon/regular/lapras.png";
const magneton = "/icons/pokemon/regular/magneton.png";
const mew = "/icons/pokemon/regular/mew.png";
const noctowl = "/icons/pokemon/regular/noctowl.png";
const porygon = "/icons/pokemon/regular/porygon.png";
const porygon2 = "/icons/pokemon/regular/porygon2.png";
const togepi = "/icons/pokemon/regular/togepi.png";
const arceus = "/icons/pokemon/regular/arceus.png";
const sprigatito = "/icons/pokemon/regular/sprigatito.png";
const fuecoco = "/icons/pokemon/regular/fuecoco.png";
const quaxly = "/icons/pokemon/regular/quaxly.png";
const miraidon = "/icons/pokemon/regular/miraidon.png";
const koraidon = "/icons/pokemon/regular/koraidon.png";
const terapagos = "/icons/pokemon/regular/terapagos.png";
const ogerpon = "/icons/pokemon/regular/ogerpon.png";
const zygarde = "/icons/pokemon/regular/zygarde.png";
const floette = "/icons/pokemon/regular/floette-eternal.png";
const hoopa = "/icons/pokemon/regular/hoopa.png";
const rayquaza = "/icons/pokemon/regular/rayquaza.png";
const darkrai = "/icons/pokemon/regular/darkrai.png";

export const getMascot = (v) => {
    switch (v) {
        case "1.22":
            return darkrai;
        case "1.21":
            return rayquaza;
        case "1.20":
            return hoopa;
        case "1.19":
            return floette;
        case "1.18":
            return zygarde;
        case "1.17":
            return ogerpon;
        case "1.16":
            return terapagos;
        case "1.15":
            return koraidon;
        case "1.14":
            return miraidon;
        case "1.13":
            return quaxly;
        case "1.12":
            return fuecoco;
        case "1.11":
            return sprigatito;
        case "1.10":
            return arceus;
        case "1.9":
            return togepi;
        case "1.8":
            return porygon2;
        case "1.7":
            return lapras;
        case "1.6":
            return magneton;
        case "1.5":
            return noctowl;
        case "1.4":
            return calyrex;
        case "1.3":
            return dugtrio;
        case "1.2":
            return kubfu;
        case "1.1":
            return porygon;
        case "1.0":
            return mew;
        default:
            return croagunk;
    }
};

const mascot = css`
    display: inline-block;
`;

interface GitHubRelease {
    id: number;
    tag_name: string;
    name: string;
    body: string;
    published_at: string;
    html_url: string;
    prerelease: boolean;
    draft: boolean;
}

const githubFetcher = async (url: string): Promise<GitHubRelease[]> => {
    const response = await fetch(url, {
        headers: {
            Accept: "application/vnd.github.v3+json",
        },
    });
    if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status}`);
    }
    return response.json();
};

export interface ReleaseDialogProps {
    isOpen: boolean;
    onClose: (e?: React.SyntheticEvent) => void;
    style: Styles;
}

export interface ReleaseNote {
    id: number;
    version: string;
    note: string;
    timestamp?: string;
}

const transformGitHubRelease = (release: GitHubRelease): ReleaseNote => ({
    id: release.id,
    version: release.tag_name.replace(/^v/, ""),
    note: release.body || "No release notes available.",
    timestamp: release.published_at,
});

export function ReleaseDialog(props: ReleaseDialogProps) {
    const [seePrevious, setSeePrevious] = React.useState(false);
    
    const { data: releases, error, isLoading } = useSwr<GitHubRelease[]>(
        props.isOpen ? GITHUB_RELEASES_URL : null,
        githubFetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );

    const latestRelease = releases?.[0];
    const allReleases = releases?.slice(1) || [];
    
    const version = latestRelease?.tag_name?.replace(/^v/, "") || "Unknown";
    const note: ReleaseNote | null = latestRelease 
        ? transformGitHubRelease(latestRelease) 
        : null;
    
    const allNotes: ReleaseNote[] = allReleases.map(transformGitHubRelease);

    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            icon={<Icon icon="document" />}
            title={`Release Notes ${version}`}
            className={`release-dialog ${props.style.editorDarkMode ? "dark" : ""}`}
        >
            <div className="release-notes-wrapper p-4">
                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Spinner size={24} />
                        <span className="ml-2 text-fg-secondary">Loading release notes...</span>
                    </div>
                )}
                
                {error && (
                    <div className="p-4 rounded-lg bg-danger-50 border border-danger-200 text-danger-700">
                        <p className="font-medium">Failed to load release notes</p>
                        <p className="text-sm mt-1">Please check your internet connection and try again.</p>
                    </div>
                )}
                
                {note && !isLoading && (
                    <>
                        <div className="flex items-center gap-3 mb-4">
                            <h3
                                className={cx(
                                    "text-xl font-bold",
                                    classWithDarkTheme(
                                        styles,
                                        "heading",
                                        props.style.editorDarkMode,
                                    ),
                                )}
                            >
                                v{version}
                            </h3>
                            <img
                                className={cx(mascot, "w-8 h-8")}
                                alt="mascot"
                                src={getMascot(getPatchlessVersion(version))}
                                style={{ imageRendering: "pixelated" }}
                            />
                            {latestRelease?.html_url && (
                                <a
                                    href={latestRelease.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary-500 hover:text-primary-600 text-sm"
                                >
                                    View on GitHub →
                                </a>
                            )}
                        </div>
                        
                        <div className="markdown-content max-w-none">
                            <ReactMarkdown>{note.note}</ReactMarkdown>
                        </div>
                        
                        {allNotes.length > 0 && (
                            <div className="mt-6 pt-4 border-t border-border">
                                <Button
                                    onClick={() => setSeePrevious(!seePrevious)}
                                    icon={
                                        seePrevious
                                            ? "chevron-up"
                                            : "chevron-down"
                                    }
                                    variant="ghost"
                                >
                                    {seePrevious ? "Hide" : "Show"} Previous Releases ({allNotes.length})
                                </Button>
                                
                                {seePrevious && (
                                    <div className="mt-4 space-y-6">
                                        {allNotes.map((prevNote) => (
                                            <div key={prevNote.id} className="border-l-2 border-border pl-4">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <img
                                                        className="w-6 h-6"
                                                        alt="mascot"
                                                        src={getMascot(getPatchlessVersion(prevNote.version))}
                                                        style={{ imageRendering: "pixelated" }}
                                                    />
                                                    <h4 className="font-semibold text-fg-primary">
                                                        v{prevNote.version}
                                                    </h4>
                                                    {prevNote.timestamp && (
                                                        <span className="text-xs text-fg-tertiary">
                                                            {new Date(prevNote.timestamp).toLocaleDateString()}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="markdown-content max-w-none text-sm">
                                                    <ReactMarkdown>{prevNote.note}</ReactMarkdown>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}
                    </>
                )}
                
                {!note && !isLoading && !error && (
                    <div className="text-center py-8 text-fg-secondary">
                        <p>No release notes available.</p>
                    </div>
                )}
            </div>
        </Dialog>
    );
}
