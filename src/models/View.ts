export interface View {
    dialogs?: DialogView;
}
export interface DialogView {
    imageUploader?: false;
    massEditor?: false;
    themeEditor?: false;
    checkpointsEditor?: false;
    rulesEditor?: false;
    importView?: false;
    exportView?: false;
    typeMatchups?: false;
}

export type DialogViewType = keyof DialogView;
