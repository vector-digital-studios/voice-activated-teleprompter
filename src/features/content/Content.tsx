import { useEffect, useLayoutEffect, useRef } from "react"
import { escape } from "html-escaper"
import { useAppDispatch, useAppSelector } from "../../app/hooks"
import { setContent, setFinalTranscriptIndex, setInterimTranscriptIndex } from "./contentSlice"

import {
  selectStatus,
  selectFontSize,
  selectMargin,
  selectOpacity,
  selectScrollOffset,
} from "../navbar/navbarSlice"

import {
  selectRawText,
  selectTextElements,
  selectFinalTranscriptIndex,
  selectInterimTranscriptIndex,
} from "./contentSlice"

import { startTeleprompter, stopTeleprompter } from "../../app/thunks"

export const Content = () => {
  const dispatch = useAppDispatch()

  const status = useAppSelector(selectStatus)
  const fontSize = useAppSelector(selectFontSize)
  const margin = useAppSelector(selectMargin)
  const opacity = useAppSelector(selectOpacity)
  const scrollOffset = useAppSelector(selectScrollOffset)
  const rawText = useAppSelector(selectRawText)
  const textElements = useAppSelector(selectTextElements)
  const finalTranscriptIndex = useAppSelector(selectFinalTranscriptIndex)
  const interimTranscriptIndex = useAppSelector(selectInterimTranscriptIndex)

  // The matcher returns the index of the last recognized word (a TOKEN).
  // Highlight that word; if the index points at a delimiter (manual mode
  // advances token by token), fall back to the word before it.
  let activeWordIndex = -1
  if (status === "started" && interimTranscriptIndex >= 0) {
    activeWordIndex =
      textElements[interimTranscriptIndex]?.type === "TOKEN"
        ? interimTranscriptIndex
        : interimTranscriptIndex - 1
  }

  const style = {
    fontSize: `${fontSize}px`,
    padding: `0 ${margin}px`,
  }

  const containerRef = useRef<null | HTMLDivElement>(null)
  const lastRef = useRef<null | HTMLDivElement>(null)
  const bottomSpacerRef = useRef<null | HTMLDivElement>(null)

  useEffect(() => {
    if (containerRef.current) {
      if (lastRef.current) {
        containerRef.current.scrollTo({
          top: Math.max(lastRef.current.offsetTop - scrollOffset, 0),
          behavior: "auto",
        })
      } else {
        containerRef.current.scrollTo({
          top: 0,
          behavior: "auto",
        })
      }
    }
  }, [interimTranscriptIndex, finalTranscriptIndex, scrollOffset])

  useLayoutEffect(() => {
    if (!containerRef.current || !bottomSpacerRef.current) {
      return
    }

    const containerHeight = containerRef.current.clientHeight
    bottomSpacerRef.current.style.height = `${scrollOffset + containerHeight}px`
  }, [scrollOffset, textElements.length])

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (status === "editing") return;

      // Skip when an input element has focus (e.g. the toolbar sliders) so
      // the keystroke keeps its native behavior instead of jumping around
      // the transcript.
      const activeElement = document.activeElement;
      const isInputFocused =
        activeElement &&
        (activeElement.tagName === "INPUT" ||
          activeElement.tagName === "TEXTAREA" ||
          activeElement.getAttribute("contenteditable") === "true");
      if (isInputFocused) return;

      const maxIndex = textElements.length - 1;

      if (event.code === "Escape") {
        event.preventDefault();
        dispatch(stopTeleprompter());
      } else if (event.code === "Space") {
        event.preventDefault();
        if (status === "stopped") {
          dispatch(startTeleprompter());
        } else if (status === "started") {
          dispatch(stopTeleprompter());
        }
      } else if (event.code === "ArrowUp") {
        event.preventDefault();
        dispatch(setFinalTranscriptIndex(Math.max(-1, finalTranscriptIndex - 15)));
        dispatch(setInterimTranscriptIndex(Math.max(-1, interimTranscriptIndex - 15)));
      } else if (event.code === "ArrowLeft") {
        event.preventDefault();
        dispatch(setFinalTranscriptIndex(Math.max(-1, finalTranscriptIndex - 5)));
        dispatch(setInterimTranscriptIndex(Math.max(-1, interimTranscriptIndex - 5)));
      } else if (event.code === "ArrowDown") {
        event.preventDefault();
        dispatch(setFinalTranscriptIndex(Math.min(maxIndex, finalTranscriptIndex + 15)));
        dispatch(setInterimTranscriptIndex(Math.min(maxIndex, interimTranscriptIndex + 15)));
      } else if (event.code === "ArrowRight") {
        event.preventDefault();
        dispatch(setFinalTranscriptIndex(Math.min(maxIndex, finalTranscriptIndex + 5)));
        dispatch(setInterimTranscriptIndex(Math.min(maxIndex, interimTranscriptIndex + 5)));
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  })

  return (
    <main className="content-area">
      {status === "started" ? (
        // Reading guide: a thin line at the height where the current line is
        // kept (the "Line position" setting). It sits outside the scrolling
        // container so it stays put while the text moves.
        <div
          className="guide-line"
          aria-hidden="true"
          style={{ top: `${scrollOffset}px` }}
        />
      ) : null}
      {status === "editing" ? (
        <textarea
          className="content"
          style={style}
          value={rawText}
          onChange={e => dispatch(setContent(e.target.value || ""))}
        />
      ) : (
        <div
          className="content"
          ref={containerRef}
          style={{
            ...style,
            opacity: opacity / 100,
          }}
        >
          {textElements.map((textElement, index, array) => {
            const itemProps =
              interimTranscriptIndex > 0 &&
              index === Math.min(interimTranscriptIndex + 2, array.length - 1)
                ? { ref: lastRef }
                : {}
            return (
              <span
                key={textElement.index}
                onClick={() => {
                  dispatch(setFinalTranscriptIndex(index - 1))
                  dispatch(setInterimTranscriptIndex(index - 1))
                }}
                className={
                  textElement.index === activeWordIndex
                    ? "active-word"
                    : finalTranscriptIndex > 0 &&
                        textElement.index <= finalTranscriptIndex + 1
                      ? "final-transcript"
                      : interimTranscriptIndex > 0 &&
                        textElement.index <= interimTranscriptIndex + 1
                      ? "interim-transcript"
                      : "future-text"
                }
                {...itemProps}
                dangerouslySetInnerHTML={{
                  __html: escape(textElement.value).replace(/\n/g, "<br>"),
                }}
              />
            )
          })}
          <div
            aria-hidden="true"
            ref={bottomSpacerRef}
            style={{ height: 0, flexShrink: 0 }}
          />
        </div>
      )}
    </main>
  )
}
