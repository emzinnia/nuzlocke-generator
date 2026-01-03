/// <reference types="vite/client" />
import * as React from "react";
import { Dialog, Icon, Spinner } from "components/ui";
import { css, cx } from "emotion";
import { Styles, getPatchlessVersion } from "utils";
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
const keldeo = "/icons/pokemon/regular/keldeo.png";

export const getMascot = (v: string) => {
    switch (v) {
        case "1.23":
            return keldeo;
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

interface VersionGroup {
    majorVersion: string;
    versions: ReleaseNote[];
}

function groupVersionsByMajor(notes: ReleaseNote[]): VersionGroup[] {
    const groups: Map<string, ReleaseNote[]> = new Map();
    
    for (const note of notes) {
        const majorVersion = getPatchlessVersion(note.version) ?? note.version;
        if (!groups.has(majorVersion)) {
            groups.set(majorVersion, []);
        }
        groups.get(majorVersion)!.push(note);
    }
    
    return Array.from(groups.entries()).map(([majorVersion, versions]) => ({
        majorVersion,
        versions,
    }));
}

const sidebarStyles = css`
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(255, 255, 255, 0.2);
        border-radius: 3px;
    }
`;

const contentStyles = css`
    scrollbar-width: thin;
    scrollbar-color: rgba(0, 0, 0, 0.2) transparent;
    
    &::-webkit-scrollbar {
        width: 6px;
    }
    
    &::-webkit-scrollbar-track {
        background: transparent;
    }
    
    &::-webkit-scrollbar-thumb {
        background: rgba(0, 0, 0, 0.2);
        border-radius: 3px;
    }
    
    .dark & {
        scrollbar-color: rgba(255, 255, 255, 0.2) transparent;
        
        &::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.2);
        }
    }
`;

const markdownStyles = css`
    h1, h2, h3, h4, h5, h6 {
        font-weight: 600;
        margin-top: 1.5rem;
        margin-bottom: 0.75rem;
        line-height: 1.3;
    }
    
    h1:first-child, h2:first-child, h3:first-child {
        margin-top: 0;
    }
    
    h2 {
        font-size: 1.25rem;
        border-bottom: 1px solid rgba(128, 128, 128, 0.2);
        padding-bottom: 0.5rem;
    }
    
    h3 {
        font-size: 1.1rem;
    }
    
    p {
        margin: 0.75rem 0;
        line-height: 1.6;
    }
    
    ul {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        list-style-type: disc;
    }
    
    ol {
        margin: 0.75rem 0;
        padding-left: 1.5rem;
        list-style-type: decimal;
    }
    
    li {
        margin: 0.375rem 0;
        line-height: 1.5;
        display: list-item;
    }
    
    li > ul {
        margin: 0.25rem 0;
        list-style-type: circle;
    }
    
    li > ol {
        margin: 0.25rem 0;
    }
    
    li > ul > li > ul {
        list-style-type: square;
    }
    
    code {
        background: rgba(128, 128, 128, 0.15);
        padding: 0.125rem 0.375rem;
        border-radius: 0.25rem;
        font-size: 0.875em;
        font-family: ui-monospace, monospace;
    }
    
    pre {
        background: rgba(0, 0, 0, 0.05);
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1rem 0;
    }
    
    .dark & pre {
        background: rgba(255, 255, 255, 0.05);
    }
    
    pre code {
        background: none;
        padding: 0;
    }
    
    a {
        color: #3b82f6;
        text-decoration: underline;
        
        &:hover {
            color: #2563eb;
        }
    }
    
    .dark & a {
        color: #60a5fa;
        
        &:hover {
            color: #93c5fd;
        }
    }
    
    strong {
        font-weight: 600;
    }
    
    blockquote {
        border-left: 3px solid rgba(128, 128, 128, 0.3);
        padding-left: 1rem;
        margin: 1rem 0;
        color: rgba(0, 0, 0, 0.6);
    }
    
    .dark & blockquote {
        color: rgba(255, 255, 255, 0.6);
    }
    
    img {
        max-width: 100%;
        height: auto;
        border-radius: 0.5rem;
        margin: 1rem 0;
    }
    
    hr {
        border: none;
        border-top: 1px solid rgba(128, 128, 128, 0.2);
        margin: 1.5rem 0;
    }
`;

export function ReleaseDialog(props: ReleaseDialogProps) {
    const [selectedVersion, setSelectedVersion] = React.useState<string | null>(null);
    
    const { data: releases, error } = useSwr<GitHubRelease[]>(
        props.isOpen ? GITHUB_RELEASES_URL : null,
        githubFetcher,
        {
            revalidateOnFocus: false,
            dedupingInterval: 60000,
        }
    );
    
    const isLoading = !releases && !error && props.isOpen;

    const allNotes: ReleaseNote[] = React.useMemo(
        () => releases?.map(transformGitHubRelease) || [],
        [releases]
    );
    
    const versionGroups = React.useMemo(
        () => groupVersionsByMajor(allNotes),
        [allNotes]
    );

    React.useEffect(() => {
        if (allNotes.length > 0 && !selectedVersion) {
            setSelectedVersion(allNotes[0].version);
        }
    }, [allNotes, selectedVersion]);

    const currentNote = allNotes.find((n) => n.version === selectedVersion);
    const currentIndex = allNotes.findIndex((n) => n.version === selectedVersion);

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setSelectedVersion(allNotes[currentIndex - 1].version);
        }
    };

    const goToNext = () => {
        if (currentIndex < allNotes.length - 1) {
            setSelectedVersion(allNotes[currentIndex + 1].version);
        }
    };

    React.useEffect(() => {
        if (!props.isOpen) return;
        
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowUp" || e.key === "ArrowLeft") {
                e.preventDefault();
                goToPrevious();
            } else if (e.key === "ArrowDown" || e.key === "ArrowRight") {
                e.preventDefault();
                goToNext();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [props.isOpen, currentIndex, allNotes]);

    const isMajorVersion = (version: string, group: VersionGroup) => {
        return group.versions[0].version === version;
    };

    return (
        <Dialog
            isOpen={props.isOpen}
            onClose={props.onClose}
            title="Release Notes"
            className={cx(
                "release-dialog max-w-4xl! p-0!",
                props.style.editorDarkMode ? "dark" : ""
            )}
        >
            <div className="flex h-160 -m-4">
                <div
                    className={cx(
                        "w-44 shrink-0 overflow-y-auto bg-gray-800 dark:bg-[#1a1a1a]",
                        sidebarStyles
                    )}
                >
                    {isLoading && (
                        <div className="flex items-center justify-center py-8">
                            <Spinner size={20} />
                        </div>
                    )}
                    
                    {!isLoading && versionGroups.map((group, groupIdx) => {
                        const hasMinorVersions = group.versions.length > 1;
                        const isLastGroup = groupIdx === versionGroups.length - 1;
                        
                        return (
                            <div key={group.majorVersion} className="relative">
                                {group.versions.map((note, idx) => {
                                    const isSelected = note.version === selectedVersion;
                                    const isMajor = idx === 0;
                                    const isLastInGroup = idx === group.versions.length - 1;
                                    
                                    return (
                                        <button
                                            key={note.id}
                                            onClick={() => setSelectedVersion(note.version)}
                                            className={cx(
                                                "w-full text-left py-2 transition-colors flex items-center relative",
                                                isSelected
                                                    ? "bg-gray-700/80 dark:bg-[#2a2a2a] text-white"
                                                    : "text-gray-300 hover:bg-gray-700/50 dark:hover:bg-[#222]"
                                            )}
                                        >
                                            {isMajor ? (
                                                <div className="w-11 shrink-0 flex justify-center relative">
                                                    <img
                                                        src={getMascot(group.majorVersion)}
                                                        alt=""
                                                        className="w-5 h-5 relative z-10"
                                                        style={{ imageRendering: "pixelated" }}
                                                    />
                                                    {hasMinorVersions && (
                                                        <div 
                                                            className="absolute left-1/2 -translate-x-1/2 w-px bg-gray-500/40"
                                                            style={{
                                                                top: '100%',
                                                                height: '0.5rem',
                                                            }}
                                                        />
                                                    )}
                                                </div>
                                            ) : (
                                                <div className="w-11 shrink-0 flex items-center justify-center relative">
                                                    <div 
                                                        className="absolute left-1/2 -translate-x-1/2 w-px bg-gray-500/40"
                                                        style={{
                                                            top: '-0.5rem',
                                                            bottom: isLastInGroup ? '50%' : '-0.5rem',
                                                        }}
                                                    />
                                                    <div 
                                                        className="absolute bg-gray-500/40"
                                                        style={{
                                                            left: '50%',
                                                            width: '0.5rem',
                                                            height: '1px',
                                                            top: '50%',
                                                        }}
                                                    />
                                                </div>
                                            )}
                                            <span className={cx(
                                                "text-sm font-medium",
                                                !isMajor && "ml-1"
                                            )}>
                                                {note.version}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>

                <div className={cx("flex-1 overflow-y-auto bg-gray-100 dark:bg-[#121212]", contentStyles)}>
                    {isLoading && (
                        <div className="flex items-center justify-center h-full">
                            <Spinner size={24} />
                            <span className="ml-2 text-gray-500 dark:text-gray-400">
                                Loading release notes...
                            </span>
                        </div>
                    )}
                    
                    {error && (
                        <div className="p-6">
                            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300">
                                <p className="font-medium">Failed to load release notes</p>
                                <p className="text-sm mt-1">Please check your internet connection and try again.</p>
                            </div>
                        </div>
                    )}
                    
                    {currentNote && !isLoading && (
                        <div className="p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <img
                                    src={getMascot(getPatchlessVersion(currentNote.version) ?? currentNote.version)}
                                    alt=""
                                    className="w-8 h-8"
                                    style={{ imageRendering: "pixelated" }}
                                />
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                                        {currentNote.version}
                                    </h2>
                                    {currentNote.timestamp && (
                                        <p className="text-sm text-gray-500 dark:text-gray-400">
                                            {new Date(currentNote.timestamp).toLocaleDateString("en-US", {
                                                year: "numeric",
                                                month: "long",
                                                day: "numeric",
                                            })}
                                        </p>
                                    )}
                                </div>
                            </div>
                            
                            <div className={cx("text-gray-800 dark:text-gray-200", markdownStyles)}>
                                <ReactMarkdown>{currentNote.note}</ReactMarkdown>
                            </div>

                            <div className="flex items-center justify-between mt-8 pt-4 border-t border-gray-200 dark:border-gray-700">
                                <button
                                    onClick={goToNext}
                                    disabled={currentIndex >= allNotes.length - 1}
                                    className={cx(
                                        "flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                                        currentIndex >= allNotes.length - 1
                                            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <Icon icon="chevron-left" size={16} />
                                    <span>Older</span>
                                </button>
                                
                                <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {currentIndex + 1} of {allNotes.length}
                                </span>
                                
                                <button
                                    onClick={goToPrevious}
                                    disabled={currentIndex <= 0}
                                    className={cx(
                                        "flex items-center gap-2 px-3 py-2 rounded text-sm transition-colors",
                                        currentIndex <= 0
                                            ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                                    )}
                                >
                                    <span>Newer</span>
                                    <Icon icon="chevron-right" size={16} />
                                </button>
                            </div>
                        </div>
                    )}
                    
                    {!currentNote && !isLoading && !error && (
                        <div className="flex items-center justify-center h-full text-gray-500 dark:text-gray-400">
                            <p>Select a version to view release notes</p>
                        </div>
                    )}
                </div>
            </div>
        </Dialog>
    );
}
