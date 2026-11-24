import type { AppThunk } from "./store"
import { start, stop } from "../features/navbar/navbarSlice"
import {
  setFinalTranscriptIndex,
  setInterimTranscriptIndex,
} from "../features/content/contentSlice"
import SpeechRecognizer from "../lib/speech-recognizer"
import { computeSpeechRecognitionTokenIndex } from "../lib/speech-matcher"

let speechRecognizer: SpeechRecognizer | null = null
let manualTimer: ReturnType<typeof setInterval> | null = null

export const startTeleprompter = (): AppThunk => (dispatch, getState) => {
  dispatch(start())

  const { language, mode, speed } = getState().navbar

  if (mode === "manual") {
    // Manual mode: advance at a constant pace, no microphone needed.
    // speed (20-200, default 50) = tokens per second x 10. Words and the
    // delimiters between them are separate tokens, so 50 -> 5 tokens/s,
    // roughly 2.5 words/s (~150 wpm). A tick runs every 100 ms.
    const { textElements, finalTranscriptIndex } = getState().content
    const maxIndex = textElements.length - 1
    const tokensPerTick = Math.max(0.15, speed / 100)
    // Start from the current position (e.g. after clicking on a word).
    let position = Math.max(0, finalTranscriptIndex)

    manualTimer = setInterval(() => {
      position += tokensPerTick
      const target = Math.min(maxIndex, Math.floor(position))
      const { finalTranscriptIndex: current } = getState().content
      if (target > current) {
        dispatch(setFinalTranscriptIndex(target))
        dispatch(setInterimTranscriptIndex(target))
      }
    }, 100)
    return
  }

  speechRecognizer = new SpeechRecognizer(language)

  if (!speechRecognizer.getIsSupported()) {
    if (process.env.NODE_ENV === "development") {
      console.warn(
        "Speech recognition is not supported in this browser. The teleprompter will work in manual mode only.",
      )
    }
    return
  }

  speechRecognizer.onresult(
    (final_transcript: string, interim_transcript: string) => {
      const {
        textElements,
        finalTranscriptIndex: lastFinalTranscriptIndex,
        interimTranscriptIndex: lastInterimTranscriptIndex,
      } = getState().content

      if (final_transcript !== "") {
        const finalTranscriptIndex = computeSpeechRecognitionTokenIndex(
          final_transcript,
          textElements,
          lastFinalTranscriptIndex,
        )
        dispatch(setFinalTranscriptIndex(finalTranscriptIndex))
      }

      if (interim_transcript !== "") {
        const interimTranscriptIndex = computeSpeechRecognitionTokenIndex(
          interim_transcript,
          textElements,
          lastFinalTranscriptIndex,
        )
        dispatch(setInterimTranscriptIndex(interimTranscriptIndex))
      }
    },
  )

  speechRecognizer.start()
}

export const stopTeleprompter = (): AppThunk => dispatch => {
  if (speechRecognizer !== null) {
    speechRecognizer.stop()
    speechRecognizer = null
  }
  if (manualTimer !== null) {
    clearInterval(manualTimer)
    manualTimer = null
  }

  dispatch(stop())
}

export const changeLanguage = (language: string): AppThunk => dispatch => {
  if (speechRecognizer !== null) {
    speechRecognizer.setLanguage(language)
  }
}
