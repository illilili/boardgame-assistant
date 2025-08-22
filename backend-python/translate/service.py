import json
import re
from typing import Dict, Any, Tuple, Optional
from utils.openai_utils import call_openai

def translate_sync(
    translation_id: int,
    target_language: str,
    feedback: Optional[str],
    content: Dict[str, Any],  # {contentId, contentType, contentData}
) -> str:
    """
    1) 원문 추출
    2) OpenAI 호출 (언어 강제 + 검증/재시도)
    3) type별 결과를 JSON 문자열로 만들어 '직접 반환'
    """
    source_text, meta = _extract_source_text(content)
    if not source_text.strip():
        raise ValueError("원문이 비어있습니다.")

    translated = _translate_with_openai(
        source_text=source_text,
        target_language=target_language,
        feedback=feedback,
        content_type=content.get("contentType"),
        meta=meta,
    )

    payload = {
        "type": meta.get("type", content.get("contentType")),
        "targetLang": target_language,
        **translated,
    }
    return json.dumps(payload, ensure_ascii=False)


# ====== helpers ======

def _extract_source_text(content: Dict[str, Any]) -> Tuple[str, Dict[str, Any]]:
    ctype = (content.get("contentType") or "").lower()
    cdata = content.get("contentData")

    if isinstance(cdata, dict):
        if ctype == "rulebook" or cdata.get("type") == "rulebook":
            src = (cdata.get("source") or {})
            text = src.get("text") or ""
            return text, {"type": "rulebook"}

        if ctype == "card_text" or cdata.get("type") == "card_text":
            name = cdata.get("name") or ""
            effect = cdata.get("effect") or ""
            desc = cdata.get("description") or ""
            text = cdata.get("text") or ""
            packed = _pack_card_text(name=name, effect=effect, description=desc, text=text)
            return packed, {"type": "card_text", "name": name, "effect": effect, "description": desc}

        raw = cdata.get("raw") or ""
        return str(raw), {"type": ctype or cdata.get("type") or "raw"}

    if isinstance(cdata, str):
        return cdata, {"type": ctype or "raw"}

    return "", {"type": ctype or "unknown"}


def _pack_card_text(name: str, effect: str, description: str, text: str) -> str:
    lines = []
    if name: lines.append(f"[NAME] {name}")
    if effect: lines.append(f"[EFFECT] {effect}")
    if description: lines.append(f"[DESCRIPTION] {description}")
    if text: lines.append(f"[TEXT] {text}")
    return "\n".join(lines)


def _looks_like_lang(text: str, target: str) -> bool:
    """아주 러프한 출력 언어 검증 휴리스틱."""
    t = (target or "").lower()
    if t.startswith("ja"):
        jp = re.findall(r"[ぁ-ゖァ-ヺ一-龯]", text)
        ko = re.findall(r"[가-힣]", text)
        return len(jp) > 20 and len(jp) > len(ko)
    if t.startswith("en"):
        ko = re.findall(r"[가-힣]", text)
        return len(ko) == 0 and len(text.strip()) > 0
    if t.startswith("zh"):
        zh = re.findall(r"[\u4e00-\u9fff]", text)
        return len(zh) > 20
    # 다른 언어는 검증 생략
    return True


def _translate_with_openai(
    source_text: str,
    target_language: str,
    feedback: Optional[str],
    content_type: Optional[str],
    meta: Dict[str, Any],
) -> Dict[str, Any]:
    fb = f"\nPublisher feedback: {feedback}\n" if feedback else ""
    hard_rule = (
        "OUTPUT LANGUAGE REQUIREMENT:\n"
        f"- You MUST write the final answer ONLY in [{target_language}].\n"
        "- Do NOT include source-language sentences except proper nouns.\n"
        "- Do NOT include any markers like '====', 'BEGIN/END', or '번역 시작/끝'.\n"
        "- Output must be CLEAN plain text only.\n"
        "- Preserve headings and list structure, but translate their text as well.\n"
    )

    prompt = (
        "You are a professional board game localization specialist.\n"
        "Translate the following content into the target language.\n"
        "Rules:\n"
        "1) Keep rules/numbers/terms exact. No inventions.\n"
        "2) Be concise and clear for players.\n"
        "3) Preserve formatting (headings/lists/numbering) and translate their text.\n"
        "4) Keep terminology consistent.\n"
        f"5) Target language code: {target_language}\n"
        f"{fb}\n"
        f"{hard_rule}\n"
        "===== SOURCE TEXT BELOW =====\n"
        f"{source_text}\n"
        "===== END OF SOURCE TEXT =====\n"
        "\nFINAL OUTPUT (translated text only, no extra markers):\n"
    )

    translated_text = call_openai(
        prompt,
        model="gpt-3.5-turbo",
        temperature=0.2,
        max_tokens=3000,
    )

    # 후처리: 혹시라도 남은 ====, BEGIN, END 같은 패턴 삭제
    translated_text = re.sub(r"={2,}.*={2,}", "", translated_text)
    translated_text = re.sub(r"(BEGIN|END|번역 시작|번역 끝|翻译开始|翻译结束|输出开始|输出结束)", "", translated_text)
    translated_text = translated_text.strip()

    # 언어 검증 → 실패 시 1회 재시도
    if not _looks_like_lang(translated_text, target_language):
        retry_prompt = prompt + (
            "\nIMPORTANT: The previous attempt included unwanted markers.\n"
            "Rewrite the entire output strictly in the target language only,\n"
            "with NO markers, NO ====, NO BEGIN/END. Just clean translated text.\n"
        )
        translated_text = call_openai(
            retry_prompt,
            model="gpt-3.5-turbo",
            temperature=0.1,
            max_tokens=3000,
        )
        translated_text = re.sub(r"={2,}.*={2,}", "", translated_text).strip()

    return {"text": translated_text}
