const featuresFromEnv = {
    themeEditing: import.meta.env.VITE_THEME_EDITING,
    temTemMode: import.meta.env.VITE_TEM_TEM_SUPPORT,
    multipleNuzlockes: import.meta.env.VITE_MULTIPLE_NUZLOCKES,
    fileUploads: import.meta.env.VITE_FILE_UPLOADS,
    newHotkeys: import.meta.env.VITE_NEW_HOTKEYS,
    resultv2: import.meta.env.VITE_RESULT_V2,
    hallOfFame: import.meta.env.VITE_HALL_OF_FAME,
    locks: import.meta.env.VITE_LOCKS,
    gen2saves: import.meta.env.VITE_GEN2_SAVES,
    imageUploads: import.meta.env.VITE_IMAGE_UPLOADS,
    emmaMode: import.meta.env.VITE_EMMA_MODE,
    tcgImages: import.meta.env.VITE_TCG_IMAGES,
    rulesetSubmission: import.meta.env.VITE_RULESET_SUBMISSION,
};

type FeatureObject = {
    [K in keyof typeof featuresFromEnv]: boolean;
};

const toBool = (v: unknown) => {
    if (typeof v === "string") return v.trim().toLowerCase() === "true";
    return Boolean(v);
};

const featuresToBooleans = (f: typeof featuresFromEnv): FeatureObject => {
    const obj: Partial<FeatureObject> = {};
    for (const feature in f) {
        obj[feature] = toBool(f[feature]);
    }
    return obj as FeatureObject;
};

export const feature = Object.freeze(featuresToBooleans(featuresFromEnv));

console.log(feature);
