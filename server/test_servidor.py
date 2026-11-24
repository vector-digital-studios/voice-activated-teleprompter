"""Prueba del servidor (stdlib, sin red externa): python -m unittest server/test_servidor.py"""
import sys
import tempfile
import threading
import unittest
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
import servidor  # noqa: E402


class TestServidor(unittest.TestCase):
    def setUp(self):
        self.tmp = tempfile.TemporaryDirectory()
        dist = Path(self.tmp.name)
        (dist / "index.html").write_text("<title>Teleprompter por voz</title>", encoding="utf-8")
        (dist / "assets").mkdir()
        (dist / "assets" / "app.js").write_text("console.log(1)", encoding="utf-8")
        self.httpd = servidor.crear_servidor(dist, "127.0.0.1", 0)  # puerto libre
        self.port = self.httpd.server_address[1]
        threading.Thread(target=self.httpd.serve_forever, daemon=True).start()

    def tearDown(self):
        self.httpd.shutdown()
        self.httpd.server_close()
        self.tmp.cleanup()

    def get(self, ruta):
        return urllib.request.urlopen(f"http://127.0.0.1:{self.port}{ruta}", timeout=5)

    def test_index_sin_cache(self):
        r = self.get("/")
        self.assertEqual(r.status, 200)
        self.assertIn("Teleprompter por voz", r.read().decode())
        self.assertEqual(r.headers.get("Cache-Control"), "no-cache")

    def test_asset(self):
        r = self.get("/assets/app.js")
        self.assertEqual(r.status, 200)
        self.assertIsNone(r.headers.get("Cache-Control"))

    def test_sin_dist_devuelve_2(self):
        with tempfile.TemporaryDirectory() as vacio:
            self.assertEqual(servidor.main(["--dist", vacio, "--port", "0"]), 2)

    def test_ips_locales_no_loopback(self):
        self.assertTrue(all(not ip.startswith("127.") for ip in servidor.ips_locales()))


if __name__ == "__main__":
    unittest.main()
