#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
MyVoca 프로젝트 전용 시스템 명세 문서 검증기 (Spec Linter)
도메인 문서들의 양식 준수 여부 및 데이터 중복 서술 금지 규칙을 자동으로 검증합니다.
"""

import os
import sys
import re

# 검사 대상 제외 경로 및 파일
EXCLUDE_DIRS = {"skills", "rules"}
EXCLUDE_FILES = set()

def lint_file(file_path):
    errors = []
    
    with open(file_path, "r", encoding="utf-8") as f:
        content = f.read()

    # 1. YAML Frontmatter 검증
    # 파일 최상단이 --- 로 시작하는지 검사
    yaml_match = re.match(r"^---\s*\n(.*?)\n---\s*\n", content, re.DOTALL)
    if not yaml_match:
        errors.append("최상단에 YAML Frontmatter 헤더(---)가 존재하지 않습니다.")
        return errors

    yaml_body = yaml_match.group(1)
    
    # category 파싱
    category_match = re.search(r"^category:\s*[\"']?(core|domain|etc)[\"']?", yaml_body, re.MULTILINE)
    if not category_match:
        errors.append("YAML 헤더 내에 category 설정이 누락되었거나 허용되지 않는 값(core, domain, etc 외)입니다.")
        category = None
    else:
        category = category_match.group(1)

    # description 파싱
    desc_match = re.search(r"^description:\s*[\"']?(.+?)[\"']?\s*$", yaml_body, re.MULTILINE)
    if not desc_match:
        errors.append("YAML 헤더 내에 description 설정이 누락되었거나 비어 있습니다.")

    # category가 domain인 파일에 대한 정밀 검증
    if category == "domain":
        # 2. 3단계 필수 헤더 포함 여부 검증
        required_headers = [
            (r"#+\s*(\d+\.)?\d*\s*시나리오\s*정의", "시나리오 정의"),
            (r"#+\s*(\d+\.)?\d*\s*필수\s*기능\s*&\s*UX\s*정의", "필수 기능 & UX 정의"),
            (r"#+\s*(\d+\.)?\d*\s*구현\s*기술\s*및\s*데이터\s*매핑", "구현 기술 및 데이터 매핑")
        ]
        for pattern, header_name in required_headers:
            if not re.search(pattern, content):
                errors.append(f"필수 헤더가 누락되었습니다: '{header_name}'")

        # 3. 데이터 중복 서술 금지 검증
        # (1) 마크다운 표(Table) 형태가 본문에 포함되어 있는지 검사
        # 컬럼 구조는 표 형식(|...|)으로 쓰지 말고 schema.md를 참조해야 함
        table_pattern = r"\n\s*\|.*\|.*\n\s*\|.*-.*\|"
        if re.search(table_pattern, content):
            errors.append("데이터 타입을 설명하는 마크다운 표(Table)가 발견되었습니다. 데이터 사양 기술은 중복 서술을 차단하고 schema.md 링크 참조로 갈음해야 합니다.")

        # (2) KEYS.MASTER, KEYS.PROFILE 등의 구조를 하드코딩 설명하는 JSON 코드 블록이 있는지 검사
        json_block_pattern = r"```json\s*\n\s*\{.*?(KEYS\.|master|voca|profile).*?\}\s*\n\s*```"
        if re.search(json_block_pattern, content, re.DOTALL | re.IGNORECASE):
            errors.append("LocalStorage 캐시 JSON 구조를 직접 기술하는 코드 블록이 발견되었습니다. 데이터 사양 기술은 중복 서술을 차단하고 schema.md 링크 참조로 갈음해야 합니다.")

        # 4. schema.md 절대 경로 마크다운 링크 포함 여부 검증
        # [schema.md](file:///.../.agents/schema.md) 형태
        schema_link_pattern = r"\[schema\.md\]\(file:///[^\)]*/\.agents/schema\.md[^\)]*\)"
        if not re.search(schema_link_pattern, content):
            errors.append("데이터 무결성 참조를 위한 schema.md 절대 경로 마크다운 링크([schema.md](file:///...))가 본문에 누락되었습니다.")

    return errors

def main():
    agents_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    print(f"[Spec Linter] 대상 디렉토리 탐색 시작: {agents_dir}")
    
    total_files = 0
    failed_files = 0
    
    # os.walk를 통한 순회 및 검사
    for root, dirs, files in os.walk(agents_dir):
        # 제외 폴더 필터링
        dirs[:] = [d for d in dirs if d not in EXCLUDE_DIRS]
        
        for file in files:
            if not file.endswith(".md"):
                continue
                
            file_path = os.path.join(root, file)
            rel_path = os.path.relpath(file_path, agents_dir)
            
            # 제외 파일 필터링
            if file in EXCLUDE_FILES:
                continue
                
            total_files += 1
            print(f"[Linting] {rel_path} 검사 중...")
            
            errors = lint_file(file_path)
            if errors:
                failed_files += 1
                print(f"❌ {rel_path} 에서 {len(errors)}개의 위반 사항이 발견되었습니다:")
                for err in errors:
                    print(f"   - {err}")
                print()
                
    if failed_files > 0:
        print(f"🚨 검증 실패: 총 {total_files}개 파일 중 {failed_files}개 파일이 규칙을 위반했습니다.")
        sys.exit(1)
    else:
        print(f"✅ 검증 성공: 총 {total_files}개 명세서 문서가 규칙을 무결하게 충족합니다.")
        sys.exit(0)

if __name__ == "__main__":
    main()
