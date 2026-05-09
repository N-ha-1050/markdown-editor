// テーマのダークモード対応
export const getEditorTheme = (mediaMatch: boolean) =>
  mediaMatch ? "ace/theme/github_dark" : "ace/theme/github"
