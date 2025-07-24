# Concept - 컨셉/테마 생성 및 요소 확장

## 기능 설명
- 주어진 키워드 또는 기획 초기 조건에 따라 게임 컨셉/테마 자동 생성
- 확장 요청 시 관련 아이디어 요소 추가 제안

## 구현할 항목
- [x] 컨셉 생성 로직 작성 (generator.py)
- [x] 컨셉 기반 요소 제안 로직 추가
- [x] /api/plans/generate-concept API 구현
- g[x] /api/plans/regenerate-concept API 구현
- [ ] /api/plans/expand-concept API 구현
> expand-concept의 경우, **콘셉아이디를 기준으로 테마, 아이디어 등으로 구성된 데이터를 가져옴->프롬프트에 추가** 하는 흐름으로 되어있어 해당 부분은 체크표시를 안함. db구성 후 수정필요. (현재는 임시데이터로 하드코딩됨.)