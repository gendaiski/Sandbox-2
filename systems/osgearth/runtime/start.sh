#!/bin/sh
set -eu
export DISPLAY=:99
export PATH=/opt/osgearth/install/bin:$PATH
export LD_LIBRARY_PATH=/opt/osgearth/install/lib:/opt/osgearth/install/lib64
export OSG_LIBRARY_PATH=/opt/osgearth/install/lib/osgPlugins-3.6.5:/opt/osgearth/install/lib64/osgPlugins-3.6.5:/usr/lib/x86_64-linux-gnu/osgPlugins-3.6.5
export GDAL_DATA=/usr/share/gdal
export PROJ_DATA=/usr/share/proj
export LIBGL_ALWAYS_SOFTWARE=1
export OSG_FILE_PATH=/opt/osgearth/source/data:/opt/osgearth/source/tests
export OSGEARTH_CACHE_PATH=/tmp/osgearth-cache
if [ "${OSGEARTH_ENABLE_DISK_CACHE:-0}" != 1 ]; then export OSGEARTH_NO_CACHE=1; fi
mkdir -p "$OSGEARTH_CACHE_PATH"
Xvfb :99 -screen 0 1280x800x24 +extension GLX +render -noreset -nolisten tcp >/tmp/xvfb.log 2>&1 &
for i in $(seq 1 30); do xdotool getdisplaygeometry >/dev/null 2>&1 && break; sleep 1; done
openbox >/tmp/openbox.log 2>&1 &
x11vnc -display :99 -localhost -forever -shared -nopw -rfbport 5900 -noxdamage -quiet >/tmp/x11vnc.log 2>&1 &
websockify 127.0.0.1:6080 127.0.0.1:5900 >/tmp/websockify.log 2>&1 &
exec python3 /app/runtime/server.py
