@echo off
REM ============================================================
REM  Teleprompter - servidor local (Windows)
REM  Sirve dist/ en http://localhost:8000
REM  Para entrar desde otro equipo de la red:  servidor.cmd --lan
REM  Otros argumentos se pasan tal cual a server\servidor.py
REM  (ej.: servidor.cmd --port 8080)
REM ============================================================
set "RAIZ=%~dp0.."
where py >nul 2>nul && (py -3 "%RAIZ%\server\servidor.py" %* & goto :eof)
python "%RAIZ%\server\servidor.py" %*
