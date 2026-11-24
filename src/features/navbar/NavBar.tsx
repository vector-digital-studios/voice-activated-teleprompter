import { useAppDispatch, useAppSelector } from "../../app/hooks"

import { startTeleprompter, stopTeleprompter } from "../../app/thunks"

import {
  toggleEdit,
  setFontSize,
  setMargin,
  setOpacity,
  setScrollOffset,
  setMode,
  setSpeed,
  selectStatus,
  selectFontSize,
  selectMargin,
  selectOpacity,
  selectScrollOffset,
  selectMode,
  selectSpeed,
} from "./navbarSlice"

import { resetTranscriptionIndices } from "../content/contentSlice"

/** Slider with the label on top and an orange filled track. */
const Slider = ({
  icon,
  label,
  min,
  max,
  step,
  value,
  display,
  onChange,
  title,
}: {
  icon: string
  label: string
  min: number
  max: number
  step: number
  value: number
  display: string
  onChange: (v: number) => void
  title?: string
}) => {
  const pct = ((value - min) / (max - min)) * 100
  return (
    <div className="slider">
      <span className="slider-label" title={title}>
        <i className={`fa-solid ${icon}`} />
        {label}
      </span>
      <div className="slider-wrap">
        <div className="slider-track" />
        <div className="slider-fill" style={{ width: `${pct}%` }} />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={e => onChange(parseInt(e.currentTarget.value, 10))}
        />
        <span className="slider-val">{display}</span>
      </div>
    </div>
  )
}

export const NavBar = () => {
  const dispatch = useAppDispatch()

  const status = useAppSelector(selectStatus)
  const fontSize = useAppSelector(selectFontSize)
  const margin = useAppSelector(selectMargin)
  const opacity = useAppSelector(selectOpacity)
  const scrollOffset = useAppSelector(selectScrollOffset)
  const mode = useAppSelector(selectMode)
  const speed = useAppSelector(selectSpeed)

  const listening = status === "started" && mode === "voice"
  const running = status === "started" && mode === "manual"

  return (
    <nav
      className="navbar is-unselectable"
      role="navigation"
      aria-label="main navigation"
    >
      <div className="navbar-brand">
        <div
          className="navbar-item brand-block"
          title="Fork de Voice-Activated Teleprompter (Julien Lecomte, MIT)"
        >
          <div className="brand-title">
            <img src="icon.png" alt="" className="brand-logo" />
            <span>Teleprompter</span>
          </div>
          <div className="brand-sub">
            <span className={`state-dot ${listening || running ? "on" : ""}`} />
            {status === "started"
              ? mode === "voice"
                ? "Escuchando"
                : "Avanza manual"
              : "Listo"}
          </div>
        </div>
      </div>
      <div className="navbar-menu is-active">
        <div className="navbar-end">
          {status === "stopped" ? (
            <>
              <div className="navbar-item">
                <div className="mode-toggle">
                  <button
                    className={`mode-btn ${mode === "voice" ? "active" : ""}`}
                    onClick={() => dispatch(setMode("voice"))}
                    title="Scroll siguiendo tu voz"
                  >
                    <i className="fa-solid fa-microphone" />
                    Voz
                  </button>
                  <button
                    className={`mode-btn ${mode === "manual" ? "active" : ""}`}
                    onClick={() => dispatch(setMode("manual"))}
                    title="Scroll a velocidad constante"
                  >
                    <i className="fa-solid fa-gauge-high" />
                    Manual
                  </button>
                </div>
              </div>

              <span className="seg" />

              <Slider
                icon="fa-text-height"
                label="Tamaño"
                min={12}
                max={200}
                step={2}
                value={fontSize}
                display={`${fontSize}`}
                onChange={v => dispatch(setFontSize(v))}
                title="Tamaño de letra"
              />
              <Slider
                icon="fa-arrows-left-right"
                label="Margen"
                min={0}
                max={2000}
                step={10}
                value={margin}
                display={`${margin}`}
                onChange={v => dispatch(setMargin(v))}
                title="Margen lateral"
              />
              <Slider
                icon="fa-eye"
                label="Opacidad"
                min={20}
                max={100}
                step={5}
                value={opacity}
                display={`${opacity}%`}
                onChange={v => dispatch(setOpacity(v))}
                title="Opacidad del texto"
              />
              <Slider
                icon="fa-align-center"
                label="Línea"
                min={0}
                max={400}
                step={5}
                value={scrollOffset}
                display={`${scrollOffset}`}
                onChange={v => dispatch(setScrollOffset(v))}
                title="Posición de la línea de lectura"
              />
              <Slider
                icon="fa-gauge"
                label="Velocidad"
                min={20}
                max={200}
                step={5}
                value={speed}
                display={`${speed}`}
                onChange={v => dispatch(setSpeed(v))}
                title="Velocidad (modo manual)"
              />
            </>
          ) : null}

          <span className="seg" />

          <div className="buttons navbar-item">
            {status !== "started" ? (
              <>
                <button
                  className={`button ${status === "editing" ? "editing" : ""}`}
                  onClick={() => dispatch(toggleEdit())}
                  title="Editar guion"
                >
                  <span className="icon is-small">
                    <i className="fa-solid fa-pencil" />
                  </span>
                  <span>Editar</span>
                </button>
                <button
                  className="button"
                  disabled={status !== "stopped"}
                  onClick={() => dispatch(resetTranscriptionIndices())}
                  title="Volver al inicio del guion"
                >
                  <span className="icon is-small">
                    <i className="fa-solid fa-arrows-rotate" />
                  </span>
                  <span>Reiniciar</span>
                </button>
              </>
            ) : null}

            <button
              className="button button-play"
              disabled={status === "editing"}
              onClick={() =>
                dispatch(
                  status === "stopped" ? startTeleprompter() : stopTeleprompter(),
                )
              }
              title={
                status === "stopped" || status === "editing" ? "Iniciar" : "Detener"
              }
            >
              <span className="icon is-small">
                <i
                  className={`fa-solid ${status === "stopped" || status === "editing" ? "fa-play" : "fa-pause"}`}
                />
              </span>
              <span>{status === "stopped" || status === "editing" ? "Iniciar" : "Pausar"}</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
