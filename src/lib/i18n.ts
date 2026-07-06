export type Lang = 'ko' | 'ja'

export type T = {
  header: { eyebrow: string; title: string }
  tabs: { home: string; add: string; cash: string; lostark: string; ledger: string; settings: string }
  entryTypes: Record<string, string>
  bossNames: Record<string, string>
  difficultyNames: Record<string, string>
  dashboard: {
    debtToGf: string
    myClaimInGfAccount: string
    myMoneySuffix: string
    myNetWorth: string
    myNetWorthPositiveSub: string
    myNetWorthNegativeSub: string
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
    settlementStatus: string
    canRepayNow: string
    canWithdrawNow: string
    afterRepayDebt: string
    claimBar: string
    debtBar: string
    repayablePart: string
    withdrawablePart: string
    remainingDebtPart: string
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
    autoFillRepay: string
    autoFillWithdraw: string
    autoFillUnavailable: string
    selectedAccountClaim: string
    repayableAmount: string
    withdrawableAmount: string
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
  finance: {
    dashboardHeroSub: string
    cashWon: string
    cashYen: string
    lostArkGold: string
    lostArkFeeTotal: string
    cumulative: string
    cashTitle: string
    cashDesc: string
    wonBalance: string
    yenBalance: string
    wonDeposit: string
    yenDeposit: string
    cashFormTitle: string
    date: string
    game: string
    direction: string
    deposit: string
    withdraw: string
    currency: string
    won: string
    yen: string
    goldUnit: string
    amount: string
    amountPlaceholder: string
    memo: string
    cashMemoPlaceholder: string
    cashSave: string
    saving: string
    recentCash: string
    noCash: string
    cashAmountError: string
    mapleLedger: string
    cashLedger: string
    lostArkLedger: string
    noCashLedger: string
    noLostArkLedger: string
    loading: string
    periodAll: string
    periodWeek: string
    periodMonth: string
    periodYear: string
    periodNet: string
    krwFlow: string
    jpyFlow: string
    goldFlow: string
    groupRecords: string
    lostArkTitle: string
    lostArkDesc: string
    currentGold: string
    depositTotal: string
    withdrawalTotal: string
    feeTotal: string
    lostArkFormTitle: string
    sellGold: string
    withdrawGold: string
    feeCheck: string
    recordedGold: string
    feeExcluded: string
    lostArkMemoPlaceholder: string
    lostArkSave: string
    recentLostArk: string
    noLostArk: string
    lostArkAmountError: string
    cashBadge: string
    fee: string
    delete: string
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
  tabs: { home: '홈', add: '입력', cash: '현금', lostark: 'LostArk', ledger: '장부', settings: '설정' },
  entryTypes: {
    boss_income: '보스 수익',
    girlfriend_income: '구버전 수입 기록',
    boss_cost_my: '오빠 돈 사용',
    boss_cost_girlfriend: '아야짱에게 빌린 돈',
    girlfriend_contribution: '아야짱이 부담한 돈',
    repay_girlfriend: '아야짱에게 상환',
    withdraw_my_share: '오빠 돈 회수',
    adjustment: '수동 조정',
  },
  bossNames: {},
  difficultyNames: {},
  dashboard: {
    debtToGf: '아야짱에게 갚을 돈',
    myClaimInGfAccount: '아야짱 통장 오빠 돈',
    myMoneySuffix: '오빠 돈',
    myNetWorth: '오빠 순보유액',
    myNetWorthPositiveSub: '상환 후 남는 오빠 돈',
    myNetWorthNegativeSub: '추가 상환 필요',
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
    overallChart: '통장 오빠 돈 대비 갚을 돈',
    settlementStatus: '정산 현황',
    canRepayNow: '지금 모두상환 가능',
    canWithdrawNow: '상환 후 모두회수 가능',
    afterRepayDebt: '상환 후 남는 빚',
    claimBar: '아야짱 통장 오빠 돈',
    debtBar: '갚을 돈',
    repayablePart: '상환 가능',
    withdrawablePart: '회수 가능',
    remainingDebtPart: '남는 빚',
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
    typeGroupIncome: '오빠 돈 증가',
    typeGroupCost: '사용/빌림',
    typeGroupSettle: '정산',
    account: '통장',
    accountHint: '아야짱 통장을 고르면 보스 수익은 아야짱 통장 오빠 돈에 쌓이고, 오빠 돈 사용은 그 금액에서 빠집니다.',
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
    shareCostBorrowed: '오빠가 갚을 돈',
    shareCostContribution: '아야짱 부담',
    shareCostError: '먼저 총 사용액을 입력하세요.',
    autoFillRepay: '모두상환',
    autoFillWithdraw: '모두회수',
    autoFillUnavailable: '입력할 금액이 없습니다.',
    selectedAccountClaim: '선택 통장 오빠 돈',
    repayableAmount: '상환 가능',
    withdrawableAmount: '회수 가능',
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
  finance: {
    dashboardHeroSub: '메이플 보스 정산, 현금통장, LostArk 수익을 한 곳에서 봅니다.',
    cashWon: '아야짱 현금통장 원',
    cashYen: '아야짱 현금통장 엔',
    lostArkGold: 'LostArk 아야짱 골드',
    lostArkFeeTotal: 'LostArk 수수료 누적',
    cumulative: '누적',
    cashTitle: '아야짱 현금통장',
    cashDesc: 'Maple과 LostArk 재화를 현금으로 팔았을 때 아야짱 몫만 기록합니다.',
    wonBalance: '원화 잔액',
    yenBalance: '엔화 잔액',
    wonDeposit: '원화 입금',
    yenDeposit: '엔화 입금',
    cashFormTitle: '현금 입출금',
    date: '날짜',
    game: '게임',
    direction: '종류',
    deposit: '입금',
    withdraw: '출금',
    currency: '통화',
    won: '원',
    yen: '엔',
    goldUnit: '골드',
    amount: '금액',
    amountPlaceholder: '예: 150000',
    memo: '메모',
    cashMemoPlaceholder: '예: 검은마법사 메소 판매분',
    cashSave: '현금 기록 추가',
    saving: '저장 중',
    recentCash: '최근 현금 기록',
    noCash: '아직 현금 기록이 없습니다.',
    cashAmountError: '금액을 입력하세요.',
    mapleLedger: '메이플 장부',
    cashLedger: '현금 장부',
    lostArkLedger: 'LostArk 장부',
    noCashLedger: '현금 기록이 없습니다.',
    noLostArkLedger: 'LostArk 기록이 없습니다.',
    loading: '불러오는 중',
    periodAll: '전체',
    periodWeek: '주간',
    periodMonth: '월간',
    periodYear: '연간',
    periodNet: '순변동',
    krwFlow: '원화 흐름',
    jpyFlow: '엔화 흐름',
    goldFlow: '골드 흐름',
    groupRecords: '기록',
    lostArkTitle: 'LostArk 아야짱 골드',
    lostArkDesc: '아이템 판매 수익은 기본 5% 수수료를 제외하고 기록합니다.',
    currentGold: '현재 골드',
    depositTotal: '입금 누적',
    withdrawalTotal: '출금 누적',
    feeTotal: '수수료 누적',
    lostArkFormTitle: 'LostArk 입출금',
    sellGold: '판매 골드',
    withdrawGold: '출금 골드',
    feeCheck: '수수료 5% 적용',
    recordedGold: '기록될 골드',
    feeExcluded: '수수료 {amount}골드 제외',
    lostArkMemoPlaceholder: '예: 보석 판매, 악세 판매',
    lostArkSave: 'LostArk 기록 추가',
    recentLostArk: '최근 LostArk 기록',
    noLostArk: '아직 LostArk 기록이 없습니다.',
    lostArkAmountError: '골드를 입력하세요.',
    cashBadge: '현금',
    fee: '수수료',
    delete: '삭제',
  },
  weekly: { week: '주차', noRecord: '기록 없음', costPrefix: '사용/빌림' },
  settings: {
    title: '설정',
    resetDay: '주간 집계 시작 요일',
    resetDayDesc: '이번 주 수익을 나눌 기준 요일입니다. 메이플 주간 보스 초기화 요일에 맞추면 편합니다.',
    days: ['일', '월', '화', '수', '목', '금', '토'],
    accounts: '통장 관리',
    accountsDesc: '서버나 계정별로 골드가 따로 있으면 통장을 나눠 추가하세요. 아야짱 통장과 오빠 계정을 여러 개 둘 수 있습니다.',
    accountAdd: '추가',
    accountAddPlaceholder: '통장 이름. 예: 아야짱 스카니아',
    accountMineCheckbox: '오빠 계정으로 추가',
    accountMineLabel: '오빠 계정',
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
  tabs: { home: 'ホーム', add: '入力', cash: '現金', lostark: 'LostArk', ledger: '帳簿', settings: '設定' },
  entryTypes: {
    boss_income: 'ボス収益',
    girlfriend_income: '旧バージョン収入記録',
    boss_cost_my: '오빠のお金を使用',
    boss_cost_girlfriend: '아야짱から借りたお金',
    girlfriend_contribution: '아야짱が負担したお金',
    repay_girlfriend: '아야짱へ返済',
    withdraw_my_share: '오빠のお金を回収',
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
    debtToGf: '아야짱へ返すお金',
    myClaimInGfAccount: '아야짱口座内の오빠のお金',
    myMoneySuffix: '内の오빠のお金',
    myNetWorth: '오빠の純保有額',
    myNetWorthPositiveSub: '返済後に残る오빠のお金',
    myNetWorthNegativeSub: '追加返済が必要',
    girlfriendContribution: '아야짱が負担したお金',
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
    settlementStatus: '精算状況',
    canRepayNow: '今すぐ全額返済可能',
    canWithdrawNow: '返済後に全額回収可能',
    afterRepayDebt: '返済後に残る借金',
    claimBar: '아야짱口座内の오빠のお金',
    debtBar: '返すお金',
    repayablePart: '返済可能',
    withdrawablePart: '回収可能',
    remainingDebtPart: '残る借金',
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
    typeGroupIncome: '오빠のお金増加',
    typeGroupCost: '使用/借入',
    typeGroupSettle: '精算',
    account: '口座',
    accountHint: 'ボス収益を아야짱口座に入れると、その口座内の오빠のお金が増えます。',
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
    shareCostButton: '아야짱1/3負担を適用',
    shareCostApplied: '1/3負担を適用済み',
    shareCostTotal: '総使用額',
    shareCostBorrowed: '오빠が返すお金',
    shareCostContribution: '아야짱負担',
    shareCostError: '先に総使用額を入力してください。',
    autoFillRepay: '全額返済',
    autoFillWithdraw: '全額回収',
    autoFillUnavailable: '入力できる金額がありません。',
    selectedAccountClaim: '選択口座内のお金',
    repayableAmount: '返済可能',
    withdrawableAmount: '回収可能',
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
  finance: {
    dashboardHeroSub: 'メイプルのボス精算、現金通帳、LostArk収益をまとめて確認します。',
    cashWon: '아야짱現金通帳 ウォン',
    cashYen: '아야짱現金通帳 円',
    lostArkGold: 'LostArk 아야짱ゴールド',
    lostArkFeeTotal: 'LostArk 手数料累計',
    cumulative: '累計',
    cashTitle: '아야짱現金通帳',
    cashDesc: 'MapleとLostArkの財貨を現金化したとき、아야짱分だけ記録します。',
    wonBalance: 'ウォン残高',
    yenBalance: '円残高',
    wonDeposit: 'ウォン入金',
    yenDeposit: '円入金',
    cashFormTitle: '現金入出金',
    date: '日付',
    game: 'ゲーム',
    direction: '種類',
    deposit: '入金',
    withdraw: '出金',
    currency: '通貨',
    won: 'ウォン',
    yen: '円',
    goldUnit: 'ゴールド',
    amount: '金額',
    amountPlaceholder: '例: 150000',
    memo: 'メモ',
    cashMemoPlaceholder: '例: 暗黒の魔法使いメル販売分',
    cashSave: '現金記録を追加',
    saving: '保存中',
    recentCash: '最近の現金記録',
    noCash: 'まだ現金記録がありません。',
    cashAmountError: '金額を入力してください。',
    mapleLedger: 'メイプル帳簿',
    cashLedger: '現金帳簿',
    lostArkLedger: 'LostArk帳簿',
    noCashLedger: '現金記録がありません。',
    noLostArkLedger: 'LostArk記録がありません。',
    loading: '読み込み中',
    periodAll: '全体',
    periodWeek: '週別',
    periodMonth: '月別',
    periodYear: '年別',
    periodNet: '純変動',
    krwFlow: 'ウォン推移',
    jpyFlow: '円推移',
    goldFlow: 'ゴールド推移',
    groupRecords: '記録',
    lostArkTitle: 'LostArk 아야짱ゴールド',
    lostArkDesc: 'アイテム販売収益は基本5%手数料を引いて記録します。',
    currentGold: '現在ゴールド',
    depositTotal: '入金累計',
    withdrawalTotal: '出金累計',
    feeTotal: '手数料累計',
    lostArkFormTitle: 'LostArk入出金',
    sellGold: '販売ゴールド',
    withdrawGold: '出金ゴールド',
    feeCheck: '手数料5%適用',
    recordedGold: '記録されるゴールド',
    feeExcluded: '手数料 {amount}ゴールド除外',
    lostArkMemoPlaceholder: '例: 宝石販売、アクセ販売',
    lostArkSave: 'LostArk記録を追加',
    recentLostArk: '最近のLostArk記録',
    noLostArk: 'まだLostArk記録がありません。',
    lostArkAmountError: 'ゴールドを入力してください。',
    cashBadge: '現金',
    fee: '手数料',
    delete: '削除',
  },
  weekly: { week: '週', noRecord: '記録なし', costPrefix: '使用/借入' },
  settings: {
    ...KO.settings,
    title: '設定',
    resetDay: '週間集計の開始曜日',
    resetDayDesc: '今週の収益を分ける基準曜日です。メイプルの週間ボス初期化日に合わせると便利です。',
    days: ['日', '月', '火', '水', '木', '金', '土'],
    accounts: '口座管理',
    accountGfLabel: '아야짱口座',
    accountsDesc: 'サーバーやアカウント別にゴールドが分かれている場合は、口座を分けて追加してください。',
    accountAdd: '追加',
    accountAddPlaceholder: '口座名。例: 아야짱 スカニア',
    accountMineCheckbox: '오빠の口座として追加',
    accountMineLabel: '오빠の口座',
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

  const fmt = (n: number) => new Intl.NumberFormat('ko-KR').format(n)
  const parts: string[] = []
  if (joPart) parts.push(`${fmt(joPart)}${units.jo}`)
  if (eokPart) parts.push(`${fmt(eokPart)}${units.eok}`)
  if (!joPart && manPart) parts.push(`${fmt(manPart)}${units.man}`)

  return parts.length > 0 ? `${sign}${parts.join(' ')}` : '0'
}
