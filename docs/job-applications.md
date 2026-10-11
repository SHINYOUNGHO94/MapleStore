# 지원 기업 / 応募企業 설치

## 기존 Supabase 프로젝트

1. 앱이 연결된 Supabase 프로젝트를 연다.
2. SQL Editor → New query에서 `database/migration_job_applications.sql` 전체를 붙여 넣고 Run한다. 이미 이 migration을 실행했다면 이 단계는 건너뛴다.
3. `database/migration_job_application_applied_on.sql`도 실행한다. 실제 지원일을 모르는 기록은 비워 둘 수 있다.

4. Table Editor에서 `public.job_applications` 생성 여부를 확인한다.
5. 업데이트한 앱에서 지원 기업 / 応募企業 탭을 열고 새로고침한다.
6. 실제 지원이 확인된 회사만 입력한다. 다른 기기에서는 같은 Supabase URL/키를 쓰는 앱을 열어 새로고침하거나 30초 기다리면 공유된다.

새 프로젝트는 기존처럼 `database/schema.sql` 전체를 실행하면 된다. migration은 재실행 가능하며 기록을 초기화하지 않는다. SQL에는 실제 회사나 샘플 데이터가 없다.

## 저장 및 중복 처리

- Supabase 설정이 있으면 DB만 사용한다. 테이블/함수가 없거나 연결 실패 시 오류를 표시하며 localStorage로 몰래 전환하지 않는다.
- 설정이 없으면 `maplestore-job-applications` localStorage 키에 저장한다. 이 모드는 해당 브라우저에만 보관된다.
- 회사명의 앞뒤/연속 공백과 영문 대소문자를 정리해 중복을 판별한다. 법인명 약어, 별칭 등 서로 다른 표기는 자동으로 같은 회사로 판단하지 않는다.
- 중복 회사는 기존 등록일과 사이트를 먼저 보여 준다. 사용자가 버튼을 누르면 선택한 사이트를 DB에서 원자적으로 합친다.
- 등록일은 최초 등록 당시 기기의 현지 날짜이며, 실제 지원일과 별도로 저장한다. 실제 지원일은 미상일 때 비워 둘 수 있다. 날짜 자체를 표시하여 UTC 변환으로 하루가 밀리지 않는다.
- 수정·삭제 시 버전을 확인해 다른 기기 변경을 덮어쓰지 않는다. 충돌 시 새로고침하고 기존 기록을 다시 선택해 수정한다.
- 화면 진입, 창 포커스 복귀, 새로고침 버튼, 30초 간격으로 동기화한다.
- 기존 메이플 장부 내보내기는 지원 기업 데이터를 포함하지 않는다.

## 현재 접근 권한

기존 schema와 동일하게 anon 키로 두 사람이 공유하는 테이블이다. RLS는 사용하지 않으며, Vercel 로그인은 Supabase 직접 API 접근을 제한하지 않는다. 따라서 Supabase URL/공개 키를 가진 사람은 이 테이블에도 접근할 수 있다. 개인별 접근 제어가 필요하면 별도 Supabase Auth/RLS 도입이 필요하다. 이번 SQL은 기존 테이블의 권한을 변경하지 않는다.

## 검증

`node scripts/test-job-applications.mjs`
`npm run build`
`npm run lint`

테스트는 메모리 저장소와 모의 Supabase만 사용하며 실제 지원 기록을 생성하지 않는다.
