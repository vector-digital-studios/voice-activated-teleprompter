#!/usr/bin/env python3
"""Servidor estático mínimo para el teleprompter (solo biblioteca estándar).

Sirve la carpeta ``dist/`` (el build de producción) para usar la app:

* en este equipo:            http://localhost:8000  (micrófono permitido)
* desde otro equipo de la LAN (con --lan): http://<IP-de-este-equipo>:8000

Uso:
    python server/servidor.py                 # solo este equipo (127.0.0.1)
    python server/servidor.py --lan           # escucha en todas las interfaces
    python server/servidor.py --port 8080 --dist ruta/a/dist

Aviso: Chrome solo da acceso al micrófono en contextos seguros (https o
localhost). Desde otro equipo por http://<IP> el modo VOZ no podrá escuchar;
el modo MANUAL funciona igual. Ver README → "Usarlo desde otro equipo".

Funciona también con pythonw.exe (sin consola): toda salida está protegida.
"""
from __future__ import annotations

import argparse
import functools
import http.server
import socket
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DIST_POR_DEFECTO = RAIZ / "dist"


def _out(msg: str) -> None:
    """print a prueba de pythonw (sys.stdout puede ser None)."""
    try:
        print(msg, flush=True)
    except Exception:
        pass


def ips_locales() -> list[str]:
    """IPs IPv4 de este equipo (sin red externa: no envía paquetes)."""
    ips: set[str] = set()
    try:
        for info in socket.getaddrinfo(socket.gethostname(), None, socket.AF_INET):
            ips.add(info[4][0])
    except OSError:
        pass
    try:
        # connect() en UDP no transmite nada; solo elige la interfaz de salida.
        # 192.0.2.1 es una dirección reservada para documentación (RFC 5737).
        with socket.socket(socket.AF_INET, socket.SOCK_DGRAM) as s:
            s.connect(("192.0.2.1", 9))
            ips.add(s.getsockname()[0])
    except OSError:
        pass
    return sorted(ip for ip in ips if not ip.startswith("127."))


class Manejador(http.server.SimpleHTTPRequestHandler):
    def end_headers(self) -> None:
        # Evita que el navegador se quede con un index.html viejo tras recompilar.
        if self.path in ("/", "/index.html"):
            self.send_header("Cache-Control", "no-cache")
        super().end_headers()

    def log_message(self, fmt: str, *args) -> None:  # noqa: D401
        try:
            sys.stderr.write("[teleprompter] %s\n" % (fmt % args))
        except Exception:
            pass


def crear_servidor(dist: Path, host: str, port: int) -> http.server.ThreadingHTTPServer:
    manejador = functools.partial(Manejador, directory=str(dist))
    return http.server.ThreadingHTTPServer((host, port), manejador)


def main(argv: list[str] | None = None) -> int:
    ap = argparse.ArgumentParser(description="Sirve dist/ del teleprompter.")
    ap.add_argument("--port", type=int, default=8000)
    ap.add_argument("--lan", action="store_true",
                    help="escuchar en 0.0.0.0 para entrar desde otro equipo de la red")
    ap.add_argument("--dist", type=Path, default=DIST_POR_DEFECTO,
                    help="carpeta del build (por defecto: dist/ del repo)")
    args = ap.parse_args(argv)

    if not (args.dist / "index.html").is_file():
        _out(f"[teleprompter] no encuentro {args.dist / 'index.html'}; corre antes: npm run build")
        return 2

    host = "0.0.0.0" if args.lan else "127.0.0.1"
    try:
        httpd = crear_servidor(args.dist, host, args.port)
    except OSError as e:
        _out(f"[teleprompter] no se pudo abrir el puerto {args.port}: {e}")
        _out("[teleprompter] ¿ya hay otro servidor corriendo en ese puerto?")
        return 1

    with httpd:
        _out(f"Teleprompter servido en {host}:{args.port}")
        _out(f"  Este equipo -> http://localhost:{args.port}")
        if args.lan:
            for ip in ips_locales():
                _out(f"  Red local   -> http://{ip}:{args.port}  (modo manual; ver README)")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            pass
    return 0


if __name__ == "__main__":
    sys.exit(main())
