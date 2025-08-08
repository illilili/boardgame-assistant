import os
import requests
from dotenv import load_dotenv

load_dotenv()
MESHY_API_KEY = os.getenv("MESHY_API_KEY")
MESHY_URL = "https://api.meshy.ai/openapi/v2/text-to-3d"

headers = {
    "Authorization": f"Bearer {MESHY_API_KEY}",
    "Content-Type": "application/json"
}

def create_meshy_preview(prompt, art_style="realistic"):
    payload = {
        "mode": "preview",
        "prompt": prompt,
        "art_style": art_style,
        "should_remesh": True
    }
    try:
        response = requests.post(MESHY_URL, headers=headers, json=payload)
        response.raise_for_status()
        return response.json().get("result")
    except requests.exceptions.HTTPError as http_err:
        print("[Meshy Preview Error]", http_err.response.status_code, http_err.response.text)
        return f"Meshy Preview 호출 실패: {http_err.response.status_code}"
    except Exception as e:
        print("[Meshy Preview Error]", e)
        return "Meshy Preview 호출 실패"

