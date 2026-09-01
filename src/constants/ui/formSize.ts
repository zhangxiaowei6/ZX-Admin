export const FORM_SIZE_MAP = {
  small:  { drawer: 480,  drawerHeight: '40vh', modal: 520 },
  medium: { drawer: 700, drawerHeight: '60vh', modal: 720 },
  large:  { drawer: 1000, drawerHeight: '80vh', modal: 960 },
} as const

export type FormSizePreset = keyof typeof FORM_SIZE_MAP
