# NoemaPalace

## 개요
NoemaPalace는 ISBN 스캔을 기반으로 책을 빠르게 등록하고 관리할 수 있는 개인 서재 웹앱입니다.  
모바일 환경에서 바코드를 스캔하여 책 정보를 자동으로 수집하고, 읽기 상태 및 간단한 분류를 통해 효율적으로 관리할 수 있습니다.

---

## 목적

- 보유한 책 목록을 빠르게 데이터화
- 읽음 / 미읽음 상태 관리
- 최소한의 입력으로 책 정리
- 모바일 환경에서 즉시 등록 가능한 워크플로우 제공

---

## 주요 기능

### 1. 책 등록
- ISBN 바코드 스캔
- ISBN 직접 입력
- 알라딘 API 기반 자동 메타데이터 조회

### 2. 상태 관리
- 미읽
- 읽는중
- 완독

### 3. 컬렉션 분류
- 만화
- 소설
- 학습
- 그외

### 4. 검색 및 조회
- 제목 검색
- 저자 검색
- ISBN 검색
- 필터 기반 조회

---

## 기술 구성

### 프론트엔드
- React + TypeScript
- Vite

### 데이터 저장
- IndexedDB (로컬 저장)

### 외부 API
- 알라딘 Open API (ISBN 기반 도서 정보 조회)

---

## 데이터 구조 (예시)

```json
{
  "isbn13": "string",
  "title": "string",
  "author": "string",
  "publisher": "string",
  "cover": "string",
  "pubDate": "string",
  "collection": "만화 | 소설 | 학습 | 그외",
  "status": "미읽 | 읽는중 | 완독",
  "createdAt": "timestamp",
  "updatedAt": "timestamp"
}
