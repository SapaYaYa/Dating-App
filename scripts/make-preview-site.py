# Rebuilds the preview site from an `expo export --platform web` dist folder.
# Asset and portrait URLs become relative to window.__APP_BASE__ (where the
# page is served); the bundle goes in js/. Assets and portraits are already
# published on the preview artifact and keep the same paths.
import os, re, sys, shutil, glob
dist, out = sys.argv[1], sys.argv[2]
src = glob.glob(os.path.join(dist, "_expo/static/js/web/entry-*.js"))[0]
name = os.path.basename(src)
js = open(src, encoding="utf-8").read()
js = js.replace('"/assets/', 'window.__APP_BASE__+"assets/')
js = re.sub(r'"https://randomuser\.me/api/portraits/(\w+)/(\d+)\.jpg"', r'window.__APP_BASE__+"portraits/\1/\2.svg"', js)
shutil.rmtree(out, ignore_errors=True)
os.makedirs(os.path.join(out, "js"))
open(os.path.join(out, "js", name), "w", encoding="utf-8").write(js)
open(os.path.join(out, "index.html"), "w").write(f"""<title>Gentoo Dating App</title>
<style>
  html, body {{ height: 100%; background: #F5F9FC; }}
  @media (prefers-color-scheme: dark) {{ html, body {{ background: #0E1A22; }} }}
  body {{ overflow: hidden; }}
  #root {{ display: flex; height: 100%; flex: 1; }}
</style>
<div id="root"></div>
<script>
  // Asset URLs are absolute against where the page is served, then the path
  // is reset to "/" so Expo Router starts on its index route.
  window.__APP_BASE__ = new URL(".", location.href).href;
  try {{ history.replaceState(null, "", "/"); }} catch (e) {{}}
  var s = document.createElement("script");
  s.src = window.__APP_BASE__ + "js/{name}";
  document.body.appendChild(s);
</script>
""")
print(name, js.count('"/assets/'), len(re.findall('randomuser', js)))
