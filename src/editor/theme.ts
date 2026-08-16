// テーマのダークモード対応
export const getEditorTheme = (mediaMatch: boolean) =>
  mediaMatch ? "vs-dark" : "vs-light"
