FROM python:3.11-slim

# 작업 디렉토리
WORKDIR /app

# 의존성 복사 및 설치
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 전체 코드 복사
COPY . .

# 포트 개방
EXPOSE 8000

# 실행 명령
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
