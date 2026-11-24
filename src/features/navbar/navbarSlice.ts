import type { PayloadAction } from "@reduxjs/toolkit"
import { createAppSlice } from "../../app/createAppSlice"

export interface NavBarSliceState {
  status: "editing" | "started" | "stopped"
  fontSize: number
  margin: number
  opacity: number
  scrollOffset: number
  language: string
  /** "voice" = follow the speaker, "manual" = scroll at a constant pace */
  mode: "voice" | "manual"
  /** manual-mode speed (20-200) */
  speed: number
}

// This fork is Spanish-first: speech recognition always uses es-ES.
export const LANGUAGE = "es-ES"

const initialState: NavBarSliceState = {
  status: "stopped",
  fontSize: 34,
  margin: 160,
  opacity: 100,
  scrollOffset: 120,
  language: LANGUAGE,
  mode: "voice",
  speed: 50,
}

export const navbarSlice = createAppSlice({
  name: "navbar",

  // `createSlice` will infer the state type from the `initialState` argument
  initialState,

  // The `reducers` field lets us define reducers and generate associated actions
  reducers: create => ({
    toggleEdit: create.reducer(state => {
      if (state.status === "editing") {
        state.status = "stopped"
      } else {
        state.status = "editing"
      }
    }),

    start: create.reducer(state => {
      state.status = "started"
    }),

    stop: create.reducer(state => {
      state.status = "stopped"
    }),

    setFontSize: create.reducer((state, action: PayloadAction<number>) => {
      state.fontSize = action.payload
    }),

    setMargin: create.reducer((state, action: PayloadAction<number>) => {
      state.margin = action.payload
    }),

    setOpacity: create.reducer((state, action: PayloadAction<number>) => {
      state.opacity = action.payload
    }),

    setScrollOffset: create.reducer((state, action: PayloadAction<number>) => {
      state.scrollOffset = action.payload
    }),

    setMode: create.reducer(
      (state, action: PayloadAction<"voice" | "manual">) => {
        state.mode = action.payload
      },
    ),

    setSpeed: create.reducer((state, action: PayloadAction<number>) => {
      state.speed = action.payload
    }),

    setLanguage: create.reducer((state, action: PayloadAction<string>) => {
      state.language = action.payload
    }),
  }),

  selectors: {
    selectStatus: state => state.status,
    selectFontSize: state => state.fontSize,
    selectMargin: state => state.margin,
    selectOpacity: state => state.opacity,
    selectScrollOffset: state => state.scrollOffset,
    selectLanguage: state => state.language,
    selectMode: state => state.mode,
    selectSpeed: state => state.speed,
  },
})

// Action creators are generated for each case reducer function.
export const {
  toggleEdit,
  start,
  stop,
  setFontSize,
  setMargin,
  setOpacity,
  setScrollOffset,
  setMode,
  setSpeed,
  setLanguage,
} = navbarSlice.actions

export const {
  selectStatus,
  selectFontSize,
  selectMargin,
  selectOpacity,
  selectScrollOffset,
  selectLanguage,
  selectMode,
  selectSpeed,
} = navbarSlice.selectors
