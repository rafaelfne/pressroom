/**
 * Popular Google Fonts available for selection.
 * The value is the font family name as it appears on Google Fonts.
 * Use '' (empty) for the default system font stack.
 */
export const GOOGLE_FONT_OPTIONS = [
  { label: 'Default (System)', value: '' },
  { label: 'Inter', value: 'Inter' },
  { label: 'Roboto', value: 'Roboto' },
  { label: 'Open Sans', value: 'Open Sans' },
  { label: 'Lato', value: 'Lato' },
  { label: 'Montserrat', value: 'Montserrat' },
  { label: 'Poppins', value: 'Poppins' },
  { label: 'Raleway', value: 'Raleway' },
  { label: 'Nunito', value: 'Nunito' },
  { label: 'Playfair Display', value: 'Playfair Display' },
  { label: 'Merriweather', value: 'Merriweather' },
  { label: 'Source Sans 3', value: 'Source Sans 3' },
  { label: 'PT Sans', value: 'PT Sans' },
  { label: 'Noto Sans', value: 'Noto Sans' },
  { label: 'Ubuntu', value: 'Ubuntu' },
  { label: 'Oswald', value: 'Oswald' },
  { label: 'Fira Sans', value: 'Fira Sans' },
  { label: 'Barlow', value: 'Barlow' },
  { label: 'Libre Baskerville', value: 'Libre Baskerville' },
  { label: 'Custom...', value: 'custom' },
] as const;

/** Build the Google Fonts CSS URL for a given font family name. */
export function googleFontUrl(family: string): string {
  return `https://fonts.googleapis.com/css2?family=${encodeURIComponent(family)}:ital,wght@0,100..900;1,100..900&display=swap`;
}
