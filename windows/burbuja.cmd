@echo off
setlocal
REM ============================================================
REM  Teleprompter - modo burbuja (Windows)
REM  1) cierra ventanas previas del teleprompter (solo esas)
REM  2) abre Chrome (o Edge) en modo app, con un perfil propio
REM     para que respete tamano y posicion
REM  3) la fija "siempre al frente"
REM
REM  Uso:  burbuja.cmd [URL]
REM  Variables opcionales: TP_URL, TP_ANCHO, TP_ALTO, TP_X, TP_Y, TP_NAVEGADOR
REM  Requisito: el servidor corriendo (servidor.cmd) o cualquier URL del build.
REM ============================================================
set "DIR=%~dp0"
if not "%~1"=="" set "TP_URL=%~1"
if not defined TP_URL set "TP_URL=http://localhost:8000"
if not defined TP_ANCHO set "TP_ANCHO=1600"
if not defined TP_ALTO set "TP_ALTO=560"
if not defined TP_X set "TP_X=60"
if not defined TP_Y set "TP_Y=60"
set "PERFIL=%LOCALAPPDATA%\teleprompter-burbuja\perfil"

if not defined TP_NAVEGADOR (
  for %%P in (
    "%ProgramFiles%\Google\Chrome\Application\chrome.exe"
    "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
    "%LOCALAPPDATA%\Google\Chrome\Application\chrome.exe"
    "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
    "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
  ) do if not defined TP_NAVEGADOR if exist %%P set "TP_NAVEGADOR=%%~P"
)
if not defined TP_NAVEGADOR (
  echo No encontre Chrome ni Edge. Define TP_NAVEGADOR con la ruta del .exe.
  exit /b 1
)

REM 1) cerrar instancias previas (sin tocar el resto del navegador)
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%DIR%cerrar_previas.ps1"

REM 2) abrir limpio en modo app
start "" "%TP_NAVEGADOR%" --app=%TP_URL% --user-data-dir="%PERFIL%" --no-first-run --no-default-browser-check --window-size=%TP_ANCHO%,%TP_ALTO% --window-position=%TP_X%,%TP_Y%

REM 3) esperar a que cargue la pagina (hasta 10 s) y fijar siempre al frente
powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%DIR%fijar_al_frente.ps1" -EsperarSeg 10
if errorlevel 1 (
  echo No pude fijar la ventana al frente: revisa que %TP_URL% cargue.
  exit /b 1
)
echo.
echo  Teleprompter burbuja abierto (%TP_ANCHO%x%TP_ALTO%). Se cierra con Alt+F4.
endlocal
