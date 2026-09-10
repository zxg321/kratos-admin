"""GIS 门户联调辅助：获取 digit 验证码并用 ddddocr 识别，输出 captcha_id 与识别结果。"""
import base64
import json
import sys
import requests
import ddddocr

BASE = "http://127.0.0.1:7001"

for attempt in range(5):
    try:
        r = requests.get(f"{BASE}/api/v1/base/captcha", params={"type": "digit"}, timeout=10)
        r.raise_for_status()
        data = r.json()
        b64 = data["captcha_base64"]
        if b64.startswith("data:"):
            b64 = b64.split(",", 1)[1]
        img = base64.b64decode(b64)
        ocr = ddddocr.DdddOcr(show_ad=False)
        code = ocr.classification(img)
        print(json.dumps({"captcha_id": data["captcha_id"], "code": code}, ensure_ascii=False))
        sys.exit(0)
    except Exception as e:  # noqa: BLE001
        print(f"attempt {attempt + 1} failed: {e}", file=sys.stderr)

sys.exit(1)
