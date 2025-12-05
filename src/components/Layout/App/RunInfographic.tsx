import * as React from "react";
import type { State } from "state";
import type { Pokemon } from "models";
import { PokemonIconPlain } from "components/Pokemon/PokemonIcon/PokemonIcon";
import { Status } from "utils/Status";
import { speciesToNumber, Species } from "utils";

interface RunInfographicProps {
    data: Partial<State>;
}

interface PokemonCounts {
    team: number;
    boxed: number;
    dead: number;
    champs: number;
}

const countPokemonByStatus = (pokemon: Pokemon[] = []): PokemonCounts => {
    return pokemon.reduce(
        (acc, p) => {
            const status = p.status?.toLowerCase();
            if (status === Status.Team) acc.team++;
            else if (status === Status.Boxed) acc.boxed++;
            else if (status === Status.Dead) acc.dead++;
            else if (status === Status.Champs) acc.champs++;
            return acc;
        },
        { team: 0, boxed: 0, dead: 0, champs: 0 }
    );
};

const filterByStatus = (pokemon: Pokemon[] = [], status: string): Pokemon[] => {
    return pokemon.filter((p) => p.status?.toLowerCase() === status);
};

// Get large Pokemon image URL from Serebii (Black/White sprites)
const getLargeImageUrl = (pokemon: Pokemon): string => {
    if (pokemon.customImage) {
        return pokemon.customImage;
    }
    if (pokemon.egg) {
        return "/img/egg.jpg";
    }
    const species = pokemon.species || "Ditto";
    const pokedexNumber = speciesToNumber(species as Species) || 132; // Default to Ditto (#132)
    const paddedNumber = pokedexNumber.toString().padStart(3, "0");
    return `https://www.serebii.net/blackwhite/pokemon/${paddedNumber}.png`;
};

interface PokemonIconWrapperProps {
    pokemon: Pokemon;
    size?: number;
    grayscale?: boolean;
}

const PokemonIconWrapper: React.FC<PokemonIconWrapperProps> = ({
    pokemon,
    size = 32,
    grayscale = false,
}) => {
    const imageStyle = {
        height: `${size}px`,
        maxWidth: "auto",
        filter: grayscale ? "grayscale(100%)" : undefined,
        opacity: grayscale ? 0.7 : 1,
    };

    return (
        <PokemonIconPlain
            id={pokemon.id}
            species={pokemon.species}
            forme={pokemon.forme}
            shiny={pokemon.shiny}
            gender={pokemon.gender}
            customIcon={pokemon.customIcon}
            egg={pokemon.egg}
            onClick={() => {}}
            selectedId={null}
            imageStyle={imageStyle}
            includeTitle
        />
    );
};

// Detailed Team Pokemon Card
const TeamPokemonCard: React.FC<{ pokemon: Pokemon }> = ({ pokemon }) => {
    const imageUrl = getLargeImageUrl(pokemon);
    const genderSymbol = pokemon.gender === "Male" || pokemon.gender === "m" 
        ? "♂" 
        : pokemon.gender === "Female" || pokemon.gender === "f" 
        ? "♀" 
        : "";
    const genderColor = pokemon.gender === "Male" || pokemon.gender === "m"
        ? "#60a5fa"
        : pokemon.gender === "Female" || pokemon.gender === "f"
        ? "#f472b6"
        : "#94a3b8";

    return (
        <div style={styles.teamCard}>
            <div style={styles.teamCardImageContainer}>
                <img
                    src={imageUrl}
                    alt={pokemon.nickname || pokemon.species}
                    style={styles.teamCardImage}
                    onError={({ currentTarget }) => {
                        currentTarget.onerror = null;
                        // Fallback to Ditto sprite if image fails to load
                        currentTarget.src = "https://www.serebii.net/blackwhite/pokemon/132.png";
                    }}
                />
                {pokemon.shiny && (
                    <span style={styles.shinyBadge} title="Shiny">✨</span>
                )}
            </div>
            <div style={styles.teamCardInfo}>
                <div style={styles.teamCardHeader}>
                    <span style={styles.teamCardNickname}>
                        {pokemon.nickname || pokemon.species}
                    </span>
                    {genderSymbol && (
                        <span style={{ ...styles.teamCardGender, color: genderColor }}>
                            {genderSymbol}
                        </span>
                    )}
                </div>
                <div style={styles.teamCardSpecies}>{pokemon.species}</div>
                {pokemon.level && (
                    <div style={styles.teamCardLevel}>Lv. {pokemon.level}</div>
                )}
                <div style={styles.teamCardDetails}>
                    {pokemon.nature && (
                        <span style={styles.teamCardDetail}>{pokemon.nature}</span>
                    )}
                    {pokemon.ability && (
                        <span style={styles.teamCardDetail}>{pokemon.ability}</span>
                    )}
                </div>
                {pokemon.item && (
                    <div style={styles.teamCardItem}>
                        <img
                            src={`/icons/hold-item/${pokemon.item.toLowerCase().replace(/'/g, "").replace(/\s/g, "-")}.png`}
                            alt={pokemon.item}
                            style={styles.itemIcon}
                            onError={({ currentTarget }) => {
                                currentTarget.onerror = null;
                                currentTarget.style.display = "none";
                            }}
                        />
                        <span>{pokemon.item}</span>
                    </div>
                )}
                {pokemon.moves && pokemon.moves.length > 0 && (
                    <div style={styles.teamCardMoves}>
                        {pokemon.moves.slice(0, 4).map((move, i) => (
                            <span key={i} style={styles.moveTag}>{move}</span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const styles: Record<string, React.CSSProperties> = {
    container: {
        backgroundColor: "#1e293b",
        borderRadius: "12px",
        padding: "20px",
        marginBottom: "16px",
        color: "#f1f5f9",
        fontFamily: "system-ui, -apple-system, sans-serif",
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
        paddingBottom: "12px",
        borderBottom: "1px solid #334155",
    },
    gameName: {
        fontSize: "20px",
        fontWeight: 600,
        color: "#f8fafc",
        margin: 0,
    },
    trainerName: {
        fontSize: "14px",
        color: "#94a3b8",
    },
    statsRow: {
        display: "flex",
        gap: "12px",
        marginBottom: "20px",
        flexWrap: "wrap" as const,
    },
    statBadge: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        backgroundColor: "#334155",
        padding: "8px 16px",
        borderRadius: "8px",
        fontSize: "14px",
    },
    statCount: {
        fontWeight: 700,
        fontSize: "18px",
    },
    teamStat: {
        color: "#4ade80",
    },
    boxedStat: {
        color: "#60a5fa",
    },
    deadStat: {
        color: "#f87171",
    },
    champsStat: {
        color: "#fbbf24",
    },
    section: {
        marginBottom: "16px",
    },
    sectionTitle: {
        fontSize: "12px",
        fontWeight: 600,
        textTransform: "uppercase" as const,
        letterSpacing: "0.05em",
        color: "#64748b",
        marginBottom: "8px",
    },
    pokemonGrid: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "8px",
        backgroundColor: "#0f172a",
        padding: "12px",
        borderRadius: "8px",
        minHeight: "40px",
    },
    emptyText: {
        color: "#475569",
        fontSize: "13px",
        fontStyle: "italic",
    },
    // Team Pokemon Card styles
    teamCardsGrid: {
        display: "flex",
        flexDirection: "column" as const,
        gap: "12px",
    },
    teamCard: {
        display: "flex",
        gap: "12px",
        backgroundColor: "#0f172a",
        borderRadius: "10px",
        padding: "12px",
        border: "1px solid #334155",
    },
    teamCardImageContainer: {
        position: "relative" as const,
        flexShrink: 0,
    },
    teamCardImage: {
        width: "80px",
        height: "80px",
        objectFit: "cover" as const,
        borderRadius: "8px",
        backgroundColor: "#1e293b",
    },
    shinyBadge: {
        position: "absolute" as const,
        top: "-4px",
        right: "-4px",
        fontSize: "14px",
    },
    teamCardInfo: {
        flex: 1,
        minWidth: 0,
        display: "flex",
        flexDirection: "column" as const,
        gap: "2px",
    },
    teamCardHeader: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
    },
    teamCardNickname: {
        fontSize: "16px",
        fontWeight: 600,
        color: "#f8fafc",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap" as const,
    },
    teamCardGender: {
        fontSize: "14px",
        fontWeight: 700,
    },
    teamCardSpecies: {
        fontSize: "12px",
        color: "#94a3b8",
    },
    teamCardLevel: {
        fontSize: "13px",
        color: "#cbd5e1",
        fontWeight: 500,
    },
    teamCardDetails: {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap" as const,
        marginTop: "2px",
    },
    teamCardDetail: {
        fontSize: "11px",
        color: "#64748b",
        backgroundColor: "#1e293b",
        padding: "2px 6px",
        borderRadius: "4px",
    },
    teamCardItem: {
        display: "flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "11px",
        color: "#a78bfa",
        marginTop: "4px",
    },
    itemIcon: {
        width: "16px",
        height: "16px",
        objectFit: "contain" as const,
    },
    teamCardMoves: {
        display: "flex",
        flexWrap: "wrap" as const,
        gap: "4px",
        marginTop: "6px",
    },
    moveTag: {
        fontSize: "10px",
        color: "#94a3b8",
        backgroundColor: "#334155",
        padding: "2px 6px",
        borderRadius: "3px",
    },
    listItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "8px 12px",
        backgroundColor: "#1e293b",
        borderRadius: "6px",
    },
    listItemName: {
        fontSize: "14px",
        fontWeight: 500,
        color: "#f1f5f9",
        flex: 1,
    },
    listItemLevel: {
        fontSize: "12px",
        color: "#64748b",
    },
};

export const RunInfographic: React.FC<RunInfographicProps> = ({ data }) => {
    const pokemon = data.pokemon || [];
    const counts = countPokemonByStatus(pokemon);
    const gameName = data.game?.customName || data.game?.name || "Unknown Game";
    const trainerName = data.trainer?.name;

    const teamPokemon = filterByStatus(pokemon, Status.Team);
    const boxedPokemon = filterByStatus(pokemon, Status.Boxed);
    const deadPokemon = filterByStatus(pokemon, Status.Dead);
    const champsPokemon = filterByStatus(pokemon, Status.Champs);

    if (pokemon.length === 0) {
        return (
            <div style={styles.container}>
                <p style={styles.emptyText}>No Pokemon data available yet.</p>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            {/* Header */}
            <div style={styles.header}>
                <h2 style={styles.gameName}>{gameName}</h2>
                {trainerName && (
                    <span style={styles.trainerName}>Trainer: {trainerName}</span>
                )}
            </div>

            {/* Stats Row */}
            <div style={styles.statsRow}>
                <div style={styles.statBadge}>
                    <span style={{ ...styles.statCount, ...styles.teamStat }}>
                        {counts.team}
                    </span>
                    <span>Team</span>
                </div>
                <div style={styles.statBadge}>
                    <span style={{ ...styles.statCount, ...styles.boxedStat }}>
                        {counts.boxed}
                    </span>
                    <span>Boxed</span>
                </div>
                <div style={styles.statBadge}>
                    <span style={{ ...styles.statCount, ...styles.deadStat }}>
                        {counts.dead}
                    </span>
                    <span>Dead</span>
                </div>
                {counts.champs > 0 && (
                    <div style={styles.statBadge}>
                        <span style={{ ...styles.statCount, ...styles.champsStat }}>
                            {counts.champs}
                        </span>
                        <span>Champs</span>
                    </div>
                )}
            </div>

            {/* Team Pokemon - Detailed Cards */}
            {teamPokemon.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Current Team</div>
                    <div style={styles.teamCardsGrid}>
                        {teamPokemon.map((p) => (
                            <TeamPokemonCard key={p.id} pokemon={p} />
                        ))}
                    </div>
                </div>
            )}

            {/* Boxed Pokemon */}
            {boxedPokemon.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Boxed</div>
                    <div style={styles.pokemonGrid}>
                        {boxedPokemon.map((p) => (
                            <div key={p.id} style={styles.listItem}>
                                <PokemonIconWrapper pokemon={p} size={32} />
                                <span style={styles.listItemName}>{p.nickname || p.species}</span>
                                {p.level && <span style={styles.listItemLevel}>Lv. {p.level}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Dead Pokemon */}
            {deadPokemon.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Fallen</div>
                    <div style={styles.pokemonGrid}>
                        {deadPokemon.map((p) => (
                            <div key={p.id} style={styles.listItem}>
                                <PokemonIconWrapper pokemon={p} size={32} grayscale />
                                <span style={{ ...styles.listItemName, color: "#64748b" }}>{p.nickname || p.species}</span>
                                {p.level && <span style={{ ...styles.listItemLevel, color: "#475569" }}>Lv. {p.level}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Champs Pokemon */}
            {champsPokemon.length > 0 && (
                <div style={styles.section}>
                    <div style={styles.sectionTitle}>Hall of Fame</div>
                    <div style={styles.pokemonGrid}>
                        {champsPokemon.map((p) => (
                            <div key={p.id} style={styles.listItem}>
                                <PokemonIconWrapper pokemon={p} size={40} />
                                <span style={{ ...styles.listItemName, color: "#fbbf24" }}>{p.nickname || p.species}</span>
                                {p.level && <span style={styles.listItemLevel}>Lv. {p.level}</span>}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

