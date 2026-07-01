export type Lang = 'ko' | 'ja'

export type T = {
  header: { eyebrow: string; title: string }
  tabs: { home: string; add: string; ledger: string; settings: string }
  entryTypes: Record<string, string>
  bossNames: Record<string, string>
  difficultyNames: Record<string, string>
  dashboard: {
    debtToGf: string
    myClaimInGfAccount: string
    myMoneySuffix: string
    girlfriendContribution: string
    girlfriendContributionSub: string
    thisWeekNet: string
    cumulativeNet: string
    noDebt: string
    repayNeeded: string
    waitingWithdraw: string
    wholeperiod: string
    bossTotal: string
    bossCostTotal: string
    repayTotal: string
    thisWeekIncome: string
    thisWeekChart: string
    overallChart: string
    recentRecords: string
    addRecord: string
    noRecord: string
    loading: string
  }
  form: {
    addTitle: string
    editTitle: string
    date: string
    type: string
    typeGroupIncome: string
    typeGroupCost: string
    typeGroupSettle: string
    account: string
    accountHint: string
    accountError: string
    amount: string
    boss: string
    memo: string
    bossPlaceholder: string
    memoPlaceholder: string
    save: string
    saving: string
    add: string
    adding: string
    cancel: string
    amountError: string
    calcTitle: string
    beforeGold: string
    afterGold: string
    calcButton: string
    calcNotPositiveError: string
    shareCostButton: string
    shareCostApplied: string
    shareCostTotal: string
    shareCostBorrowed: string
    shareCostContribution: string
    shareCostError: string
    itemName: string
    itemNamePlaceholder: string
    costItemMode: string
    costManualMode: string
    itemCartTitle: string
    itemCartEmpty: string
    itemCartTotal: string
    itemCartAdd: string
    bossPresetMode: string
    bossManualMode: string
    bossCartTitle: string
    bossCartEmpty: string
    bossCartTotal: string
    bossCartAdd: string
  }
  units: { jo: string; eok: string; man: string; raw: string }
  ledger: {
    title: string
    allView: string
    weeklyView: string
    filterAll: string
    noRecord: string
  }
  weekly: { week: string; noRecord: string; costPrefix: string }
  settings: {
    title: string
    resetDay: string
    resetDayDesc: string
    days: string[]
    accounts: string
    accountsDesc: string
    accountAdd: string
    accountAddPlaceholder: string
    accountMineCheckbox: string
    accountMineLabel: string
    accountGfLabel: string
    accountInUse: string
    accountLastError: string
    backup: string
    export: string
    import: string
    connection: string
    supabaseConnected: string
    localMode: string
    supabaseDesc: string
    account: string
    logout: string
    refresh: string
  }
  toast: {
    saved: string
    updated: string
    deleted: string
    imported: string
    saveError: string
    updateError: string
    deleteError: string
    importError: string
    noImportData: string
    notFound: string
    loadError: string
  }
  misc: { records: string; supabase: string; local: string }
}

const KO: T = {
  header: { eyebrow: 'MapleStore', title: '주간보스 정산장' },
  tabs: { home: '홈', add: '입력', ledger: '장부', settings: '설정' },
  entryTypes: {
    boss_income: '보스 수익',
    girlfriend_income: '구버전 수입 기록',
    boss_cost_my: '내 돈 사용',
    boss_cost_girlfriend: '아야짱에게 빌린 돈',
    girlfriend_contribution: '아야짱이 부담한 돈',
    repay_girlfriend: '아야짱에게 상환',
    withdraw_my_share: '내 돈 회수',
    adjustment: '수동 조정',
  },
  bossNames: {},
  difficultyNames: {},
  dashboard: {
    debtToGf: '아야짱에게 갚을 돈',
    myClaimInGfAccount: '아야짱 통장 내 돈',
    myMoneySuffix: '내 돈',
    girlfriendContribution: '아야짱이 부담한 돈',
    girlfriendContributionSub: '1/3 분담 누적',
    thisWeekNet: '이번 주 순수익',
    cumulativeNet: '누적 순수익',
    noDebt: '빚 없음',
    repayNeeded: '상환 필요',
    waitingWithdraw: '회수 대기',
    wholeperiod: '전체 기간',
    bossTotal: '보스 수익 합계',
    bossCostTotal: '사용/빌림 합계',
    repayTotal: '상환 누적',
    thisWeekIncome: '이번 주 보스 수익',
    thisWeekChart: '이번 주 수익 대비 사용/빌림',
    overallChart: '통장 내 돈 대비 갚을 돈',
    recentRecords: '최근 기록',
    addRecord: '+ 입력',
    noRecord: '기록 없음. 입력 탭에서 추가하세요.',
    loading: '불러오는 중',
  },
  form: {
    addTitle: '기록 입력',
    editTitle: '기록 수정',
    date: '날짜',
    type: '종류',
    typeGroupIncome: '내 돈 증가',
    typeGroupCost: '사용/빌림',
    typeGroupSettle: '정산',
    account: '통장',
    accountHint: '아야짱 통장을 고르면 보스 수익은 아야짱 통장 내 돈에 쌓이고, 내 돈 사용은 그 금액에서 빠집니다.',
    accountError: '통장을 선택하세요.',
    amount: '금액',
    boss: '보스',
    memo: '메모',
    bossPlaceholder: '예: 스우 하드',
    memoPlaceholder: '필요할 때만 입력',
    save: '저장',
    saving: '저장 중',
    add: '추가',
    adding: '추가 중',
    cancel: '취소',
    amountError: '금액을 입력하세요.',
    calcTitle: '차액으로 빌린 돈 계산',
    beforeGold: '사용 전 잔액',
    afterGold: '사용 후 잔액',
    calcButton: '차액을 빌린 돈으로 입력',
    calcNotPositiveError: '사용 후 잔액이 사용 전보다 크거나 같습니다.',
    shareCostButton: '아야짱 1/3 부담 적용',
    shareCostApplied: '1/3 부담 적용됨',
    shareCostTotal: '총 사용액',
    shareCostBorrowed: '내가 갚을 돈',
    shareCostContribution: '아야짱 부담',
    shareCostError: '먼저 총 사용액을 입력하세요.',
    itemName: '항목',
    itemNamePlaceholder: '예: 심볼 강화, 장비 강화',
    costItemMode: '아이템 빠른 추가',
    costManualMode: '직접 입력',
    itemCartTitle: '추가할 아이템',
    itemCartEmpty: '아이템을 누르면 여기에 쌓입니다.',
    itemCartTotal: '합계',
    itemCartAdd: '한번에 추가',
    bossPresetMode: '보스 빠른 추가',
    bossManualMode: '직접 입력',
    bossCartTitle: '추가할 보스',
    bossCartEmpty: '보스를 눌러 난이도를 고르면 여기에 쌓입니다.',
    bossCartTotal: '합계',
    bossCartAdd: '한번에 추가',
  },
  units: { jo: '조', eok: '억', man: '만', raw: '메소' },
  ledger: {
    title: '장부',
    allView: '전체 목록',
    weeklyView: '주간별',
    filterAll: '전체',
    noRecord: '기록 없음',
  },
  weekly: { week: '주차', noRecord: '기록 없음', costPrefix: '사용/빌림' },
  settings: {
    title: '설정',
    resetDay: '주간 집계 시작 요일',
    resetDayDesc: '이번 주 수익을 나눌 기준 요일입니다. 메이플 주간 보스 초기화 요일에 맞추면 편합니다.',
    days: ['일', '월', '화', '수', '목', '금', '토'],
    accounts: '통장 관리',
    accountsDesc: '서버나 계정별로 골드가 따로 있으면 통장을 나눠 추가하세요. 아야짱 통장과 내 계정을 여러 개 둘 수 있습니다.',
    accountAdd: '추가',
    accountAddPlaceholder: '통장 이름. 예: 아야짱 스카니아',
    accountMineCheckbox: '내 계정으로 추가',
    accountMineLabel: '내 계정',
    accountGfLabel: '아야짱 통장',
    accountInUse: '기록에서 사용 중인 통장은 삭제할 수 없습니다.',
    accountLastError: '통장은 최소 1개 있어야 합니다.',
    backup: '데이터 백업',
    export: 'JSON 내보내기',
    import: 'JSON 가져오기',
    connection: 'DB 연결',
    supabaseConnected: 'Supabase 연결됨',
    localMode: '로컬 모드',
    supabaseDesc: '.env.local에 Supabase 값을 넣으면 클라우드 저장을 사용합니다.',
    account: '계정',
    logout: '로그아웃',
    refresh: '새로고침',
  },
  toast: {
    saved: '저장됨',
    updated: '수정됨',
    deleted: '삭제됨',
    imported: '가져오기 완료',
    saveError: '저장 실패',
    updateError: '수정 실패',
    deleteError: '삭제 실패',
    importError: '가져오기 실패',
    noImportData: '가져올 기록이 없습니다.',
    notFound: '기록을 찾을 수 없습니다.',
    loadError: '불러오기 실패',
  },
  misc: { records: '건', supabase: 'Supabase', local: '로컬' },
}

const JA: T = {
  ...KO,
  header: { eyebrow: 'MapleStore', title: '週間ボス精算帳' },
  tabs: { home: 'ホーム', add: '入力', ledger: '帳簿', settings: '設定' },
  entryTypes: {
    boss_income: 'ボス収益',
    girlfriend_income: '旧バージョン収入記録',
    boss_cost_my: '自分のお金を使用',
    boss_cost_girlfriend: 'アヤちゃんから借りたお金',
    girlfriend_contribution: 'アヤちゃんが負担したお金',
    repay_girlfriend: 'アヤちゃんへ返済',
    withdraw_my_share: '自分のお金を回収',
    adjustment: '手動調整',
  },
  bossNames: {
    zakum: 'ジャクム',
    pierre: 'ピエール',
    vanban: 'バンバン',
    bloodyqueen: 'ブラッディクイーン',
    vellum: 'ベルルム',
    magnus: 'マグナス',
    papulatus: 'パプラトゥス',
    swoo: 'スウ',
    damien: 'デミアン',
    'guardian-angel-slime': 'ガーディアンエンジェルスライム',
    lucid: 'ルシード',
    will: 'ウィル',
    dusk: 'ダスク',
    dunkel: 'デュンケル',
    'true-hilla': '真ヒルラ',
    'black-mage': '暗黒の魔法使い',
    seren: 'セレン',
    kalos: '監視者カロス',
    kaling: 'カリーン',
    limbo: 'リンボ',
    baldrix: 'バルドリックス',
    'first-adversary': '最初の対敵者',
    hungsung: '凶星',
    jupiter: 'ユピテル',
    meilin: 'メイリン',
  },
  difficultyNames: {
    이지: 'イージー',
    노멀: 'ノーマル',
    하드: 'ハード',
    카오스: 'カオス',
    익스트림: 'エクストリーム',
    일반: '一般',
  },
  dashboard: {
    ...KO.dashboard,
    debtToGf: 'アヤちゃんへ返すお金',
    myClaimInGfAccount: 'アヤちゃん口座の自分のお金',
    myMoneySuffix: '内の自分のお金',
    girlfriendContribution: 'アヤちゃんが負担したお金',
    girlfriendContributionSub: '1/3負担の累計',
    thisWeekNet: '今週の純収益',
    cumulativeNet: '累計純収益',
    noDebt: '借金なし',
    repayNeeded: '返済が必要',
    waitingWithdraw: '回収待ち',
    wholeperiod: '全期間',
    bossTotal: 'ボス収益合計',
    bossCostTotal: '使用/借入合計',
    repayTotal: '返済累計',
    thisWeekIncome: '今週のボス収益',
    thisWeekChart: '今週の収益と使用/借入',
    overallChart: '口座内のお金と返すお金',
    recentRecords: '最近の記録',
    addRecord: '+ 入力',
    noRecord: '記録なし。入力タブから追加してください。',
    loading: '読み込み中',
  },
  form: {
    ...KO.form,
    addTitle: '記録入力',
    editTitle: '記録編集',
    date: '日付',
    type: '種類',
    typeGroupIncome: '自分のお金増加',
    typeGroupCost: '使用/借入',
    typeGroupSettle: '精算',
    account: '口座',
    accountHint: 'ボス収益をアヤちゃん口座に入れると、その口座内の自分のお金が増えます。',
    accountError: '口座を選択してください。',
    amount: '金額',
    boss: 'ボス',
    memo: 'メモ',
    bossPlaceholder: '例: スウ ハード',
    memoPlaceholder: '必要な時だけ入力',
    save: '保存',
    saving: '保存中',
    add: '追加',
    adding: '追加中',
    cancel: 'キャンセル',
    amountError: '金額を入力してください。',
    calcTitle: '差額で借りたお金を計算',
    beforeGold: '使用前残高',
    afterGold: '使用後残高',
    calcButton: '差額を借りたお金として入力',
    calcNotPositiveError: '使用後残高が使用前残高以上です。',
    shareCostButton: 'アヤちゃん1/3負担を適用',
    shareCostApplied: '1/3負担を適用済み',
    shareCostTotal: '総使用額',
    shareCostBorrowed: '自分が返すお金',
    shareCostContribution: 'アヤちゃん負担',
    shareCostError: '先に総使用額を入力してください。',
    itemName: '項目',
    itemNamePlaceholder: '例: シンボル強化、装備強化',
    costItemMode: 'アイテム簡単追加',
    costManualMode: '直接入力',
    itemCartTitle: '追加するアイテム',
    itemCartEmpty: 'アイテムを押すとここに入ります。',
    itemCartTotal: '合計',
    itemCartAdd: 'まとめて追加',
    bossPresetMode: 'ボス簡単追加',
    bossManualMode: '直接入力',
    bossCartTitle: '追加するボス',
    bossCartEmpty: 'ボスを押して難易度を選ぶとここに入ります。',
    bossCartTotal: '合計',
    bossCartAdd: 'まとめて追加',
  },
  units: { jo: '兆', eok: '億', man: '万', raw: 'メル' },
  ledger: {
    title: '帳簿',
    allView: '全体一覧',
    weeklyView: '週別',
    filterAll: '全て',
    noRecord: '記録なし',
  },
  weekly: { week: '週', noRecord: '記録なし', costPrefix: '使用/借入' },
  settings: {
    ...KO.settings,
    title: '設定',
    resetDay: '週間集計の開始曜日',
    resetDayDesc: '今週の収益を分ける基準曜日です。メイプルの週間ボス初期化日に合わせると便利です。',
    days: ['日', '月', '火', '水', '木', '金', '土'],
    accounts: '口座管理',
    accountGfLabel: 'アヤちゃん口座',
    accountsDesc: 'サーバーやアカウント別にゴールドが分かれている場合は、口座を分けて追加してください。',
    accountAdd: '追加',
    accountAddPlaceholder: '口座名。例: アヤちゃん スカニア',
    accountMineCheckbox: '自分の口座として追加',
    accountMineLabel: '自分の口座',
    accountInUse: '記録で使用中の口座は削除できません。',
    accountLastError: '口座は最低1つ必要です。',
    backup: 'データバックアップ',
    export: 'JSONを書き出し',
    import: 'JSONを読み込み',
    connection: 'DB接続',
    supabaseConnected: 'Supabase接続済み',
    localMode: 'ローカルモード',
    supabaseDesc: '.env.localにSupabaseの値を入れるとクラウド保存を使います。',
    account: 'アカウント',
    logout: 'ログアウト',
    refresh: '更新',
  },
  toast: {
    saved: '保存しました',
    updated: '更新しました',
    deleted: '削除しました',
    imported: '読み込み完了',
    saveError: '保存失敗',
    updateError: '更新失敗',
    deleteError: '削除失敗',
    importError: '読み込み失敗',
    noImportData: '読み込める記録がありません。',
    notFound: '記録が見つかりません。',
    loadError: '読み込み失敗',
  },
  misc: { records: '件', supabase: 'Supabase', local: 'ローカル' },
}

export function getT(lang: Lang): T {
  return lang === 'ko' ? KO : JA
}

export function formatMesoT(value: number, units: T['units']): string {
  const jo = 10_000 * 100_000_000
  const eok = 100_000_000
  const man = 10_000

  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(Math.round(value))
  if (abs === 0) return '0'

  const joPart = Math.floor(abs / jo)
  const eokPart = Math.floor((abs % jo) / eok)
  const manPart = Math.floor((abs % eok) / man)
  const rest = abs % man

  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n)
  const parts: string[] = []
  if (joPart) parts.push(`${fmt(joPart)}${units.jo}`)
  if (eokPart) parts.push(`${fmt(eokPart)}${units.eok}`)
  if (!joPart && manPart) parts.push(`${fmt(manPart)}${units.man}`)
  if (!joPart && !eokPart && rest) parts.push(fmt(rest))

  return `${sign}${parts.join(' ')}`
}
