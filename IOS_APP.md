# iPhone 앱 빌드 방법

이 프로젝트는 Capacitor로 iOS 앱 프로젝트가 생성되어 있습니다.

## 준비물

- Mac
- Xcode
- Node.js
- Apple ID
- `.env.local`

무료 Apple ID로도 내 iPhone에 설치 테스트는 가능합니다. 다만 무료 계정은 서명 유효기간이 짧습니다. TestFlight나 안정적인 배포는 Apple Developer Program이 필요합니다.

## Mac에서 실행

```bash
git pull
npm install
npm run ios:sync
npm run ios:open
```

Mac에도 기존과 같은 `.env.local`이 있어야 합니다.

```env
VITE_SUPABASE_URL=Supabase Project URL
VITE_SUPABASE_PUBLISHABLE_KEY=Supabase Publishable Key
```

Xcode가 열리면:

1. 왼쪽에서 `App` 프로젝트 선택
2. `Signing & Capabilities` 열기
3. Team에 본인 Apple ID 선택
4. iPhone을 Mac에 연결
5. 실행 대상에서 iPhone 선택
6. Run 버튼 누르기

## 데이터

앱은 기존 웹과 같은 Supabase DB를 사용합니다.
웹에서 입력한 기록과 iPhone 앱에서 입력한 기록은 같은 데이터입니다.

## 다시 빌드할 때

웹 기능을 수정한 뒤 iOS 앱에 반영하려면:

```bash
npm run ios:sync
```

그 다음 Xcode에서 다시 Run 하면 됩니다.
