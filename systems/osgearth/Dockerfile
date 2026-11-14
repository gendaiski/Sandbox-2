FROM ubuntu:24.04
ENV DEBIAN_FRONTEND=noninteractive
RUN apt-get update -qq && apt-get install -y --no-install-recommends \
 build-essential cmake ninja-build git ca-certificates curl \
 libgl-dev libopenscenegraph-dev libgdal-dev libgeos-dev liblerc-dev libsqlite3-dev \
 protobuf-compiler libprotobuf-dev libtinyxml-dev libglew-dev libzip-dev zipcmp zipmerge ziptool libspdlog-dev \
 libmeshoptimizer-dev libwebp-dev libdraco-dev libfreetype-dev libharfbuzz-dev \
 libblosc-dev libbenchmark-dev xvfb x11vnc novnc websockify openbox mesa-utils \
 python3 python3-pil xdotool fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
ARG OSGEARTH_REVISION=16de96a16b10bce7f2167897826998060edc49f0
RUN git init /opt/osgearth/source && cd /opt/osgearth/source && git remote add origin https://github.com/pelicanmapping/osgearth.git && git fetch --depth 1 origin ${OSGEARTH_REVISION} && git checkout --detach FETCH_HEAD
COPY runtime/prepare_source.py /tmp/prepare_source.py
RUN python3 /tmp/prepare_source.py /opt/osgearth/source
RUN cmake -S /opt/osgearth/source -B /opt/osgearth/build -G Ninja \
 -DCMAKE_BUILD_TYPE=Release -DCMAKE_INSTALL_PREFIX=/opt/osgearth/install \
 -DOSGEARTH_BUILD_TOOLS=ON -DOSGEARTH_BUILD_EXAMPLES=ON -DOSGEARTH_BUILD_TESTS=ON \
 -DOSGEARTH_BUILD_IMGUI_NODEKIT=ON -DOSGEARTH_BUILD_PROCEDURAL_NODEKIT=ON \
 -DOSGEARTH_BUILD_PRESTIGE_NODEKIT=ON -DOSGEARTH_BUILD_LEGACY_CONTROLS_API=ON \
 -DOSGEARTH_BUILD_LEGACY_SPLAT_NODEKIT=ON -DOSGEARTH_BUILD_BENCHMARKS=ON \
 -DOSGEARTH_ENABLE_GEOCODER=ON -DOSGEARTH_ENABLE_FASTDXT=OFF && cmake --build /opt/osgearth/build --parallel 3 \
 && cmake --install /opt/osgearth/build && rm -rf /opt/osgearth/build
ENV PATH="/opt/osgearth/install/bin:${PATH}" LD_LIBRARY_PATH="/opt/osgearth/install/lib:/opt/osgearth/install/lib64" OSG_FILE_PATH="/opt/osgearth/source/data:/opt/osgearth/source/tests" DISPLAY=:99 LIBGL_ALWAYS_SOFTWARE=1
WORKDIR /opt/osgearth/source/tests

COPY web /app/web
COPY runtime /app/runtime
RUN cp -r /usr/share/novnc /app/web/novnc && useradd -m -u 10001 explorer && chmod -R a+rX /opt/osgearth /app && chmod +x /app/runtime/start.sh
USER explorer
EXPOSE 8080
CMD ["/app/runtime/start.sh"]
