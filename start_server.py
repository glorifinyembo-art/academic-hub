import http.server
import socketserver
import webbrowser
import os
import json

PORT = 3000
DIRECTORY = os.path.dirname(os.path.abspath(__file__))

def read_env():
    """Lit le fichier .env dynamiquement sur le serveur"""
    env_vars = {
        "SUPABASE_URL": "",
        "SUPABASE_ANON_KEY": ""
    }
    env_path = os.path.join(DIRECTORY, ".env")
    
    if os.path.exists(env_path):
        try:
            with open(env_path, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line and not line.startswith("#") and "=" in line:
                        key, val = line.split("=", 1)
                        key = key.strip()
                        val = val.strip().strip('"').strip("'")
                        env_vars[key] = val
        except Exception as e:
            print(f"[Serveur] Erreur de lecture de .env : {e}")
    return env_vars

class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)

    def do_GET(self):
        # Point d'API sécurisé qui lit le .env localement
        if self.path == "/api/env":
            env_data = read_env()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Cache-Control", "no-cache, no-store, must-revalidate")
            self.end_headers()
            self.wfile.write(json.dumps(env_data).encode("utf-8"))
            return

        super().do_GET()

    def end_headers(self):
        self.send_header('Service-Worker-Allowed', '/')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

def run():
    os.chdir(DIRECTORY)
    port = PORT
    while port < PORT + 20:
        try:
            with socketserver.TCPServer(("", port), Handler) as httpd:
                print(f"==================================================")
                print(f"  Serveur UniDocs démarré !")
                print(f"  URL : http://localhost:{port}")
                print(f"  Fichier .env : {os.path.join(DIRECTORY, '.env')}")
                print(f"==================================================")
                webbrowser.open(f"http://localhost:{port}")
                httpd.serve_forever()
                break
        except OSError:
            port += 1

if __name__ == '__main__':
    run()
