import highlightLightCss from "highlight.js/styles/github.min.css?raw"
import highlightDarkCss from "highlight.js/styles/github-dark.min.css?raw"

export const getHighlightStyle = (mediaMatch: boolean) =>
  mediaMatch ? highlightDarkCss : highlightLightCss
