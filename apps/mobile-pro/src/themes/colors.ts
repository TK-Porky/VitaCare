/**
 * VitaCare Pro — Palette de couleurs
 * Palette indigo/bleu professionnel pour distinguer le portail pro du portail patient (vert)
 */

export const colors = {
  // Primary — Indigo professionnel
  primary:      '#4F6EF7',
  primaryLight: '#7B93FF',
  primaryMid:   '#3D5CE8',
  primaryDark:  '#2B47D4',

  // Gradient
  gradientStart: '#7B93FF',
  gradientMid1:  '#4F6EF7',
  gradientMid2:  '#3D5CE8',
  gradientEnd:   '#2B47D4',

  // Neutral
  ink:      '#1B1E2E',
  inkLight: 'rgba(27, 30, 46, 0.60)',
  inkMuted: 'rgba(27, 30, 46, 0.40)',
  inkFaint: 'rgba(27, 30, 46, 0.15)',

  // Backgrounds
  white:   '#FFFFFF',
  surface: '#F8F9FC',
  border:  '#ECEDF5',

  // Semantic
  error:        '#FF3B30',
  errorLight:   'rgba(255, 59, 48, 0.10)',
  warning:      '#FF9500',
  warningLight: 'rgba(255, 149, 0, 0.10)',
  success:      '#34C759',
  successLight: 'rgba(52, 199, 89, 0.10)',
  info:         '#4F6EF7',
  infoLight:    'rgba(79, 110, 247, 0.10)',

  // Status RDV
  statusConfirmed: '#34C759',
  statusPending:   '#FF9500',
  statusCancelled: '#FF3B30',
  statusCompleted: '#4F6EF7',
} as const;

export type Colors = typeof colors;
export type ColorKey = keyof Colors;
