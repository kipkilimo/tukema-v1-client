import { md3 } from "vuetify/blueprints";
import { createVuetify, type ThemeDefinition } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";

/**
 * TUKEM Museum — Light Theme
 * ----------------------------------
 * Primary   : #8B4513  (earthy brown — brand / buttons)
 * Secondary : #2B2B2B  (charcoal — nav / headings)
 * Accent    : #F08228  (ochre — highlights / CTAs)
 * Background: #F5EFE6  (cream — page bg)
 * Dark      : #1A1A1A  (footer / dark sections)
 */
const light: ThemeDefinition = {
  dark: false,
  colors: {
    // Core brand palette
    primary: "#8B4513",
    secondary: "#2B2B2B",
    accent: "#F08228",

    // Surface + background
    background: "#F5EFE6",
    surface: "#FFFFFF",

    // Semantic
    success: "#2E7D32",
    warning: "#F9A825",
    error: "#D32F2F",
    info: "#1976D2",

    // "On" colors (text/icon over the palette)
    "on-primary": "#FFFFFF",
    "on-secondary": "#FFFFFF",
    "on-accent": "#FFFFFF",
    "on-background": "#2B2B2B",
    "on-surface": "#2B2B2B",
    "on-success": "#FFFFFF",
    "on-warning": "#1A1A1A",
    "on-error": "#FFFFFF",
    "on-info": "#FFFFFF",
  },
};

/**
 * TUKEM Museum — Dark Theme
 */
const dark: ThemeDefinition = {
  dark: true,
  colors: {
    primary: "#4EA8FF",
    "primary-darken-1": "#0B6FC4",

    secondary: "#AEB5BC",
    "secondary-darken-1": "#7D8792",

    accent: "#7CC7FF",

    background: "#0F1724",
    surface: "#172231",

    success: "#66BB6A",
    warning: "#FBC02D",
    error: "#EF5350",
    info: "#64B5F6",

    "on-primary": "#081018",
    "on-secondary": "#081018",
    "on-accent": "#081018",
    "on-background": "#FFFFFF",
    "on-surface": "#FFFFFF",
  },
};

export default createVuetify({
  blueprint: md3,
  components,
  directives,
  theme: {
    defaultTheme: "light",
    themes: {
      light,
      dark,
    },
  },
});