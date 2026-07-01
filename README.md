# MapleStore

메이플 주간보스 수익과 아야짱 통장 안의 내 돈을 기록하는 개인 정산 앱입니다.

## 로컬 실행

```bash
npm install
npm.cmd run dev
```

## Supabase 설정

새 DB라면 Supabase SQL Editor에서 `database/schema.sql`을 실행합니다.

이미 예전 `ledger_entries.location` 구조로 만든 DB라면 `database/migration_accounts.sql`을 실행합니다.
여러 번 실행해도 안전합니다.

`.env.local`:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key_here
```

## 정산 규칙

- `보스 수익`을 `아야짱 통장`으로 입력하면 `아야짱 통장 내 돈`이 증가합니다.
- `보스 비용(내 돈)`을 `아야짱 통장`으로 입력하면 `아야짱 통장 내 돈`이 감소합니다.
- `보스 비용(아야짱 돈)`은 `아야짱에게 갚을 돈`을 증가시킵니다.
- `아야짱에게 상환`은 갚을 돈을 줄입니다.
- `내 돈 회수`는 아야짱 통장 안의 내 돈을 줄입니다.

## Vercel 배포

Vercel Environment Variables에 아래 값을 넣습니다.

```env
VITE_SUPABASE_URL=...
VITE_SUPABASE_PUBLISHABLE_KEY=...
APP_USER=원하는_아이디
APP_PASSWORD=원하는_비밀번호
SESSION_SECRET=긴_랜덤_문자열
```

`APP_USER`, `APP_PASSWORD`, `SESSION_SECRET`는 배포 환경에서 반드시 직접 설정해야 합니다.

현재 로그인은 둘이 쓰기 위한 가벼운 보호입니다. 더 강한 보안이 필요하면 Supabase Auth + RLS로 바꾸는 게 맞습니다.

## 확인 명령

```bash
npm.cmd run build
npm.cmd run lint
```
