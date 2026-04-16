FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    build-essential \
    cmake \
    libgl1 \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    git \
    && rm -rf /var/lib/apt/lists/*

COPY . /app

RUN python -m pip install --no-cache-dir --upgrade pip
RUN python -m pip install --no-cache-dir setuptools==69.5.1 wheel
RUN python -m pip install --no-cache-dir fastapi "uvicorn[standard]" numpy pillow python-multipart
RUN python -m pip install --no-cache-dir face_recognition
RUN python -m pip install --no-cache-dir git+https://github.com/ageitgey/face_recognition_models.git

# Verify everything at build time
RUN python -c "import pkg_resources; print('pkg_resources OK')"
RUN python -c "import face_recognition_models; print('face_recognition_models OK')"
RUN python -c "import face_recognition; print('face_recognition OK')"

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
