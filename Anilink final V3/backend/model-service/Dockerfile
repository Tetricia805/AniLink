FROM python:3.11-slim-bookworm

WORKDIR /app

# Stage 1: Install lightweight deps (cached; fast)
COPY requirements-base.txt .
RUN pip install --no-cache-dir --timeout 300 -r requirements-base.txt

# Stage 2: Install onnxruntime (6.8MB; longer timeout for slow networks)
COPY requirements.txt .
ENV PIP_DEFAULT_TIMEOUT=1800
RUN pip install --no-cache-dir --timeout 1800 -r requirements.txt

COPY . .

EXPOSE 9002

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "9002"]
