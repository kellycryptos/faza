export type Language = "en" | "zh";

export interface Translations {
  // Navigation
  navAbout: string;
  navGuide: string;
  navActivity: string;
  networkMainnet: string;
  networkTestnet: string;
  selectNetwork: string;
  connectWallet: string;
  wrongNetwork: string;
  switchNetwork: string;

  // Hero Section
  heroHeadline: string;
  heroSubtext: string;
  heroPositioning: string;

  // 3-Step Summary
  stepStakeLabel: string;
  stepCheckInLabel: string;
  stepSettleLabel: string;

  // Tabs
  tabBonds: string;
  tabDeals: string;

  // Buttons
  btnNewBond: string;
  btnNewDeal: string;
  btnCancel: string;
  btnProtocolGuide: string;
  btnHideGuide: string;

  // Filters & Search
  filterAll: string;
  filterMyBonds: string;
  filterMyDeals: string;
  filterOpen: string;
  filterReady: string;
  searchBondsPlaceholder: string;
  searchDealsPlaceholder: string;

  // Card & Feed Labels
  cardEachStakes: string;
  cardDeadline: string;
  cardCreator: string;
  cardJoiner: string;
  cardSeller: string;
  cardBuyer: string;
  cardPrice: string;
  cardStake: string;
  cardTimeLeft: string;
  cardWaitingJoiner: string;
  cardWaitingBuyer: string;
  cardCheckInCreator: string;
  cardCheckInJoiner: string;
  cardPvP: string;
  cardBondOnly: string;
  cardTimeLeftSuffix: string;

  // Status Labels
  statusOpen: string;
  statusLive: string;
  statusSettled: string;
  statusExpired: string;
  statusReady: string;
  statusTemplate: string;
  statusCancelled: string;
  statusForfeit: string;
  statusAttested: string;
  statusActionNeeded: string;

  // Protocol Guide Content
  guideTag: string;
  guideTitle: string;
  guideIntro: string;
  guideStep1Title: string;
  guideStep1Text: string;
  guideStep2Title: string;
  guideStep2Text: string;
  guideStep3Title: string;
  guideStep3Text: string;

  // Claim & Balances
  claimTitle: string;
  claimDesc: string;
  withdrawBondStake: string;
  withdrawOtcStake: string;
  claimButton: string;

  // Template Warnings
  templateBadge: string;
  templateNoticeTitle: string;
  templateNoticeBondDesc: string;
  templateNoticeDealDesc: string;
  createLiveBondBtn: string;
  createLiveDealBtn: string;
}

export const translations: Record<Language, Translations> = {
  en: {
    // Navigation
    navAbout: "About",
    navGuide: "Protocol Guide",
    navActivity: "My Activity",
    networkMainnet: "Arc Mainnet",
    networkTestnet: "Arc Testnet Sandbox",
    selectNetwork: "Select Network View",
    connectWallet: "Connect Wallet",
    wrongNetwork: "Wrong network",
    switchNetwork: "Switch",

    // Hero Section
    heroHeadline: "Show up, or forfeit the stake.",
    heroSubtext: "Two wallets lock USDC on Arc. Both show up and get it back. One ghosts and the other takes both.",
    heroPositioning: "Autonomous bilateral coordination with native USDC settlement — deterministic escrow on Arc Mainnet with zero admin keys.",

    // 3-Step Summary
    stepStakeLabel: "Stake in",
    stepCheckInLabel: "Check in",
    stepSettleLabel: "Settle",

    // Tabs
    tabBonds: "Show-up bonds",
    tabDeals: "OTC deals",

    // Buttons
    btnNewBond: "New bond",
    btnNewDeal: "New deal",
    btnCancel: "Cancel",
    btnProtocolGuide: "Protocol Guide",
    btnHideGuide: "Hide guide",

    // Filters & Search
    filterAll: "All",
    filterMyBonds: "My bonds",
    filterMyDeals: "My deals",
    filterOpen: "Open",
    filterReady: "Ready to settle",
    searchBondsPlaceholder: "Search bonds by title, creator, or ID…",
    searchDealsPlaceholder: "Search deals by buyer, seller, or ID…",

    // Card & Feed Labels
    cardEachStakes: "Each stakes",
    cardDeadline: "Deadline",
    cardCreator: "Creator",
    cardJoiner: "Joiner",
    cardSeller: "Seller",
    cardBuyer: "Buyer",
    cardPrice: "Price",
    cardStake: "Stake",
    cardTimeLeft: "Time left",
    cardWaitingJoiner: "Waiting for joiner…",
    cardWaitingBuyer: "Waiting for buyer…",
    cardCheckInCreator: "Creator",
    cardCheckInJoiner: "Joiner",
    cardPvP: "PvP",
    cardBondOnly: "Bond only",
    cardTimeLeftSuffix: "left",

    // Status Labels
    statusOpen: "Open",
    statusLive: "Live",
    statusSettled: "Settled",
    statusExpired: "Expired",
    statusReady: "Ready to settle",
    statusTemplate: "Template",
    statusCancelled: "Cancelled",
    statusForfeit: "Forfeit",
    statusAttested: "Attested",
    statusActionNeeded: "Action needed",

    // Protocol Guide Content
    guideTag: "Protocol Architecture",
    guideTitle: "How Faza Works & Live Contracts",
    guideIntro: "Faza is an autonomous bilateral coordination and settlement protocol built for Arc Mainnet (with Arc Testnet sandbox support) where USDC functions as the native gas token. Two wallets lock USDC, commit to identical terms, and settle purely onchain with zero intermediary custody.",
    guideStep1Title: "Gas & Settlement",
    guideStep1Text: "Gas is fractions of a cent paid directly in native USDC. On Arc Mainnet, bridge USDC via bridge.arc.io. In sandbox, test USDC is available via faucet.",
    guideStep2Title: "Show-up Bonds",
    guideStep2Text: "Wallet A locks a USDC stake and sets a deadline. Wallet B joins with matching stake. Both check in before deadline to unlock refund. If one party ghosts, the one who checked in claims both stakes.",
    guideStep3Title: "OTC Deal Tickets",
    guideStep3Text: "Seller commits a term sheet hashed onchain (keccak256). Buyer joins with identical hash. Settle tokens automatically or bond offchain delivery.",

    // Claim & Balances
    claimTitle: "Unclaimed Funds Available:",
    claimDesc: "You have settled stakes or refunds waiting in contract escrow ready to withdraw.",
    withdrawBondStake: "Withdraw Bond Stake",
    withdrawOtcStake: "Withdraw OTC Stake",
    claimButton: "Claim",

    // Template Warnings
    templateBadge: "Curated Template",
    templateNoticeTitle: "Curated Template (Not Deployed On-Chain)",
    templateNoticeBondDesc: "Bond #{id} is an ecosystem demo template and has not been created on the Arc blockchain yet. On-chain actions are disabled to prevent contract execution errors.",
    templateNoticeDealDesc: "Deal #{id} is an ecosystem demo template and has not been created on the Arc blockchain yet. On-chain actions are disabled to prevent contract execution errors.",
    createLiveBondBtn: "+ Create a Live Show-Up Bond",
    createLiveDealBtn: "+ Create a Live OTC Deal",
  },
  zh: {
    // Navigation
    navAbout: "关于协议",
    navGuide: "协议指南",
    navActivity: "我的活动",
    networkMainnet: "Arc 主网",
    networkTestnet: "Arc 测试网沙箱",
    selectNetwork: "选择网络视图",
    connectWallet: "连接钱包",
    wrongNetwork: "网络不匹配",
    switchNetwork: "切换网络",

    // Hero Section
    heroHeadline: "准时履约，否则没收押金。",
    heroSubtext: "两个钱包在 Arc 链上锁定 USDC。双方如约履约即可取回，一方违约则另一方全部拿走。",
    heroPositioning: "Arc 链上原生 USDC 结算的自主双边协作协议 — 纯链上确定性智能合约托管，无管理员密钥。",

    // 3-Step Summary
    stepStakeLabel: "存入押金",
    stepCheckInLabel: "链上打卡",
    stepSettleLabel: "到期结算",

    // Tabs
    tabBonds: "履约承诺",
    tabDeals: "场外交易",

    // Buttons
    btnNewBond: "发起契约",
    btnNewDeal: "发起交易",
    btnCancel: "取消",
    btnProtocolGuide: "协议指南",
    btnHideGuide: "收起指南",

    // Filters & Search
    filterAll: "全部",
    filterMyBonds: "我的契约",
    filterMyDeals: "我的交易",
    filterOpen: "待匹配",
    filterReady: "待清算",
    searchBondsPlaceholder: "按标题、发起人或编号搜索契约…",
    searchDealsPlaceholder: "按买卖方地址或编号搜索交易…",

    // Card & Feed Labels
    cardEachStakes: "双方押金",
    cardDeadline: "截止时间",
    cardCreator: "发起方",
    cardJoiner: "匹配方",
    cardSeller: "卖方",
    cardBuyer: "买方",
    cardPrice: "总价",
    cardStake: "押金",
    cardTimeLeft: "剩余时间",
    cardWaitingJoiner: "等待对方匹配…",
    cardWaitingBuyer: "等待买方承接…",
    cardCheckInCreator: "发起方",
    cardCheckInJoiner: "匹配方",
    cardPvP: "PvP",
    cardBondOnly: "仅押金",
    cardTimeLeftSuffix: "剩余",

    // Status Labels
    statusOpen: "待匹配",
    statusLive: "履约中",
    statusSettled: "已结算",
    statusExpired: "已逾期",
    statusReady: "待清算",
    statusTemplate: "演示模板",
    statusCancelled: "已取消",
    statusForfeit: "已没收",
    statusAttested: "已签署",
    statusActionNeeded: "需您操作",

    // Protocol Guide Content
    guideTag: "协议运行机制",
    guideTitle: "Faza 运行原理与已部署合约",
    guideIntro: "Faza 是构建于 Arc 主网（及测试网沙箱）上的去中心化双边履约协议，采用 USDC 作为原生 Gas 费。双方锁定对等保证金，确认相同条款，无需任何第三方中介，完全由智能合约执行最终清算。",
    guideStep1Title: "Gas 与清算资产",
    guideStep1Text: "Gas 费用极低，仅需零点几美分且直接使用原生 USDC 支付。主网可通过 bridge.arc.io 跨链，测试沙箱可通过水龙头领取测试币。",
    guideStep2Title: "双人履约押注",
    guideStep2Text: "发起方锁定 USDC 押金并设定到期截止时间。匹配方存入对等押金。截止前双方打卡即可取回本金；若一方失联违约，打卡履约的一方即可领走双方全部押金。",
    guideStep3Title: "场外交易票据",
    guideStep3Text: "卖方提交经由链上哈希（keccak256）固化的条款清单，买方确认匹配。代币交易可自动原子结算，非代币类交付则提供双向押金约束。",

    // Claim & Balances
    claimTitle: "发现可提取资金：",
    claimDesc: "您有已清算的押金或退回款项暂存于智能合约中，随时可以提回钱包。",
    withdrawBondStake: "提取押注资金",
    withdrawOtcStake: "提取场外资金",
    claimButton: "提取",

    // Template Warnings
    templateBadge: "精选模板",
    templateNoticeTitle: "精选演示模板 (尚未部署至链上)",
    templateNoticeBondDesc: "契约 #{id} 为生态演示模板，尚未在 Arc 区块链上创建。为避免钱包模拟交易报错，链上操作已暂时禁用。",
    templateNoticeDealDesc: "交易 #{id} 为生态演示模板，尚未在 Arc 区块链上创建。为避免钱包模拟交易报错，链上操作已暂时禁用。",
    createLiveBondBtn: "+ 发起真实履约契约",
    createLiveDealBtn: "+ 发起真实场外交易",
  },
};

export function getTranslation(lang: Language = "en"): Translations {
  return translations[lang] || translations.en;
}

export type TranslationKey = keyof Translations;

export function t(key: TranslationKey, lang: Language = "en"): string {
  const dict = getTranslation(lang);
  return dict[key] ?? translations.en[key] ?? key;
}
