from utils.openai_utils import call_openai

def translate_to_thumbnail_prompt(title: str, theme: str, storyline: str) -> str:
    prompt = (
        "Translate the following Korean board game summary into a natural and rich English prompt, "
        "suitable for DALL·E to generate a box cover thumbnail illustration.\n\n"
        f"- 제목: {title or '제목 없음'}\n"
        f"- 테마: {theme or '기본 테마'}\n"
        f"- 스토리라인: {storyline or '기본 스토리'}\n\n"
        "The image must NOT contain any logos, text, labels, titles, or packaging. "
        "Only a pure illustration suitable for a board game cover thumbnail."
    )

    result = call_openai(prompt, model="gpt-4")
    return result.strip()
