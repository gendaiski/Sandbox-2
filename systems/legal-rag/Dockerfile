FROM python:3.12-slim
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends build-essential git ninja-build tesseract-ocr tesseract-ocr-eng poppler-utils && rm -rf /var/lib/apt/lists/*
COPY requirements.txt constraints-cpu.txt ./
RUN pip install --no-cache-dir torch==2.5.1+cpu --index-url https://download.pytorch.org/whl/cpu && pip install --no-cache-dir -r requirements.txt -c constraints-cpu.txt --extra-index-url https://download.pytorch.org/whl/cpu
COPY . .
ENV LEGALRAG_LANGUAGE=en HF_HOME=/runtime/models LEGALRAG_DATA_DIR=/runtime/data TORCH_EXTENSIONS_DIR=/runtime/extensions OMP_NUM_THREADS=2 MAX_JOBS=2 TOKENIZERS_PARALLELISM=false PORT=7860
EXPOSE 7860
CMD ["sh", "scripts/start_english.sh"]
