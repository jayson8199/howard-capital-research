/* ============================================================
 * Howard Capital Research —— 数据层
 * ------------------------------------------------------------
 * 本文件是全站唯一数据源。严格遵循与 ChatGPT（首席投资研究官）
 * 确认过的 V1 十条规则：
 *  1. 市场事实(marketFact) 与 研究判断(anchors/scores) 彻底分离
 *  2. 当前市值必须由 price × totalShares 现场计算，不允许硬编码
 *  3. 每个市场数据字段都带 asOfDate / sourceName / sourceNote
 *  4. 锚定值必须有推导公式字段(forecastNetProfit × 合理PE × 调整系数)
 *  5. 五级锚点必须满足 excellent < safe < reasonable < optimistic < bubble，
 *     顺序校验失败在控制台直接抛错，不允许静默展示
 *  6. 当前所在估值区间由代码自动计算，不在数据里人工填写
 *  7. 安全边际统一为 (reasonable - marketCap) / reasonable，允许负数
 *  8. 保留 listingStatus / exchange / shareClass / currency /
 *     valuationType / marketCapScope 等口径字段
 *  9. 评分展示构成与权重，总分自动求和，不允许只写一个总分
 * 10. 催化剂(catalysts) 与风险(risks) 分开，不混在一起
 *
 * 注意：以下数值为根据用户与 ChatGPT 讨论内容整理的【示例/模拟数据】，
 * 不是实时行情，仅用于跑通产品逻辑。上线前需要替换为真实数据源。
 * ============================================================ */

const DATA_AS_OF = "2026-08-06";
const DATA_SOURCE_NOTE = "股价：已切换至东方财富（push2 API）真实行情，与同花顺数据交叉核对一致，最近一次拉取时间见上方日期，为收盘延迟行情而非逐笔实时；长鑫科技已于2026-07-27正式上市，价格已更新为真实成交价。总股本/PE/PB等字段为此前整理的估算值，未逐一核实最新数据，仅供参考。估值锚点/评分等研究判断字段与行情无关，均为示例/主观研究结论。";

const COMPANIES = [
  {
    code: "688825",
    name: "长鑫科技",
    industry: "存储芯片",
    mainBusiness: "中国大陆规模最大的DRAM存储芯片设计与制造企业，产品覆盖DDR4/DDR5及HBM预研。",
    globalBenchmark: "SK海力士、美光",
    domesticReplacementRate: "★★★★★（中国大陆唯一大规模DRAM量产厂）",
    nationalStrategyLevel: "国家战略级（存储自主可控）",
    listingStatus: "ipo_pending",
    exchange: "科创板",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "IPOValuation",
    marketCapScope: "发行后总股本",
    marketFact: {
      price: 51.96,
      totalShares: 668.8,
      floatShares: 66.9,
      calculatedMarketCap: null,
      reportedMarketCap: 34748,
      marketCapMethod: "最新收盘价 × 发行后总股本",
      peTTM: null,
      pb: null,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "2026-07-27已正式上市（发行价8.66元），首日及随后几个交易日大幅上涨；本行情为东方财富公开接口数据，与同花顺交叉核对一致。总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。"
    },
    anchors: {
      excellent: 6000,
      safe: 9000,
      reasonable: 14500,
      optimistic: 22000,
      bubble: 30000,
      forecastProfitYear: 2028,
      forecastNetProfit: 100,
      reasonablePELow: 110,
      reasonablePEHigh: 150,
      baseFairValue: 13000,
      adjustmentFactor: 1.12,
      adjustedFairValue: 14560,
      anchorExplanation: "预测2028年净利润100亿元，给予110~150倍合理PE（对标SK海力士稀缺期估值上限），得到基准合理市值约1.3万亿元；因其为中国大陆唯一规模化DRAM厂，叠加AI服务器HBM潜力，给予1.12倍稀缺性溢价，调整后合理市值约1.456万亿元。"
    },
    scores: [
      { name: "行业空间", score: 20, maxScore: 20, reason: "全球存储行业规模巨大，国产化率仍处早期。" },
      { name: "竞争壁垒", score: 18, maxScore: 20, reason: "技术与量产经验壁垒高，但仍落后海外一代左右。" },
      { name: "成长性", score: 19, maxScore: 20, reason: "国产替代+AI服务器HBM需求驱动收入快速增长。" },
      { name: "估值", score: 16, maxScore: 20, reason: "IPO定价相对保守，但上市初期博弈情绪波动大。" },
      { name: "技术趋势", score: 15, maxScore: 20, reason: "HBM等高端产品仍在验证阶段，需观察量产节奏。" }
    ],
    catalysts: [
      "HBM产品验证通过并放量",
      "存储行业价格周期上行",
      "国产服务器/AI芯片配套需求扩大",
      "上市后纳入重要指数"
    ],
    risks: [
      "DRAM价格周期波动剧烈，利润不具备线性可预测性",
      "持续高强度资本开支，自由现金流承压",
      "海外存储厂商价格战风险",
      "上市初期流动性与情绪博弈导致股价大幅波动"
    ],
    research: {
      oneLiner: "中国大陆唯一规模化DRAM厂，存储自主可控的稀缺标的。",
      whyNotHigher: "DRAM是强周期行业，利润波动大，市场不敢线性外推当前景气度；且上市初期缺乏历史业绩验证，机构给的稀缺溢价有上限。",
      sellTriggers: "存储价格周期见顶回落、HBM验证进度大幅低于预期、或市值显著突破乐观锚且缺乏新的业绩验证。"
    },
    thesis: [
      "中国大陆唯一规模化DRAM量产厂，国产替代具有唯一性",
      "AI服务器带动HBM需求快速增长",
      "国家战略级支持，长期资本开支有保障",
      "存储价格周期终将上行，带来利润弹性"
    ],
    timeline: [
      { year: "2019", event: "启动DDR4规模量产" },
      { year: "2021", event: "启动DDR5规模量产" },
      { year: "2024", event: "启动科创板上市辅导" },
      { year: "2026-07", event: "计划科创板上市" },
      { year: "2027（预期）", event: "HBM产品导入验证/小批量量产" }
    ]
  },
  {
    code: "688981",
    name: "中芯国际",
    industry: "晶圆代工",
    mainBusiness: "中国大陆规模最大、技术最先进的晶圆代工企业，覆盖成熟制程到先进制程。",
    globalBenchmark: "台积电（TSMC）",
    domesticReplacementRate: "★★★★☆",
    nationalStrategyLevel: "国家战略级（先进制程自主可控核心资产）",
    listingStatus: "listed",
    exchange: "科创板 / 港交所",
    shareClass: "A+H股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "A股口径（本页仅展示A股）",
    marketFact: {
      price: 124.15,
      totalShares: 117.4,
      floatShares: 79.3,
      calculatedMarketCap: null,
      reportedMarketCap: 14575,
      marketCapMethod: "最新收盘价 × A股总股本",
      peTTM: 45,
      pb: 5.2,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "A+H两地上市，本站仅统一展示A股口径，港股口径需单独计算。总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 9000,
      safe: 12000,
      reasonable: 16000,
      optimistic: 22000,
      bubble: 30000,
      forecastProfitYear: 2028,
      forecastNetProfit: 160,
      reasonablePELow: 90,
      reasonablePEHigh: 110,
      baseFairValue: 16000,
      adjustmentFactor: 1.0,
      adjustedFairValue: 16000,
      anchorExplanation: "预测2028年净利润160亿元，给予90~110倍合理PE（先进制程国产替代核心资产溢价），基准合理市值约1.6万亿元，暂不额外调整。"
    },
    scores: [
      { name: "行业空间", score: 20, maxScore: 20, reason: "全球晶圆代工需求持续增长，先进制程国产化空间巨大。" },
      { name: "竞争壁垒", score: 17, maxScore: 20, reason: "技术仍落后台积电2~3代，但客户粘性与规模优势明显。" },
      { name: "成长性", score: 17, maxScore: 20, reason: "受设备进口限制影响，扩产节奏存在不确定性。" },
      { name: "估值", score: 14, maxScore: 20, reason: "长期享受国产替代溢价，估值中枢显著高于台积电。" },
      { name: "技术趋势", score: 16, maxScore: 20, reason: "先进制程持续追赶，成熟制程盈利能力稳定。" }
    ],
    catalysts: [
      "先进制程良率持续提升",
      "国产设备导入比例提高，突破设备瓶颈",
      "国内AI芯片/汽车芯片代工需求扩张"
    ],
    risks: [
      "先进制程设备与材料受出口管制影响",
      "行业景气周期波动，成熟制程价格承压",
      "资本开支强度高，折旧压力大"
    ],
    research: {
      oneLiner: "先进制程国产替代核心资产，国家战略级晶圆代工龙头。",
      whyNotHigher: "先进制程技术仍落后台积电2~3代，设备与材料受出口管制制约扩产节奏，市场需要看到良率和产能持续兑现才敢给更高倍数。",
      sellTriggers: "先进制程扩产明显不及预期、出口管制进一步收紧导致产能受限、或成熟制程价格战侵蚀整体盈利能力。"
    },
    thesis: [
      "国产先进制程唯一有能力大规模量产的代工厂",
      "国家战略价值最高，长期获得资本与政策支持",
      "成熟制程持续贡献稳定现金流",
      "全球晶圆代工需求长期增长"
    ],
    timeline: [
      { year: "2004", event: "公司成立" },
      { year: "2019", event: "科创板上市" },
      { year: "2023", event: "先进制程量产爬坡" },
      { year: "2026（推进中）", event: "先进制程良率与产能持续提升" }
    ]
  },
  {
    code: "002371",
    name: "北方华创",
    industry: "半导体设备",
    mainBusiness: "国产半导体设备平台型龙头，覆盖刻蚀、薄膜沉积、清洗、炉管等多品类设备。",
    globalBenchmark: "Applied Materials（应用材料）",
    domesticReplacementRate: "★★★★☆",
    nationalStrategyLevel: "国家战略级（设备自主可控核心资产）",
    listingStatus: "listed",
    exchange: "深交所",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 742.5,
      totalShares: 10.0,
      floatShares: 9.4,
      calculatedMarketCap: null,
      reportedMarketCap: 7425,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 68,
      pb: 9.5,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 5000,
      safe: 6500,
      reasonable: 9000,
      optimistic: 12000,
      bubble: 16000,
      forecastProfitYear: 2028,
      forecastNetProfit: 120,
      reasonablePELow: 65,
      reasonablePEHigh: 80,
      baseFairValue: 8700,
      adjustmentFactor: 1.03,
      adjustedFairValue: 8961,
      anchorExplanation: "预测2028年净利润120亿元，给予65~80倍合理PE（设备平台型龙头，成长确定性高），基准合理市值约8700亿元，因平台化扩张给予1.03倍小幅溢价，调整后约8961亿元。"
    },
    scores: [
      { name: "行业空间", score: 19, maxScore: 20, reason: "国产设备渗透率仍有较大提升空间。" },
      { name: "竞争壁垒", score: 18, maxScore: 20, reason: "多品类平台化布局，客户覆盖面广。" },
      { name: "成长性", score: 18, maxScore: 20, reason: "受益于晶圆厂持续扩产，订单能见度较高。" },
      { name: "估值", score: 13, maxScore: 20, reason: "当前估值已price in较高成长预期。" },
      { name: "技术趋势", score: 17, maxScore: 20, reason: "刻蚀、薄膜等核心设备持续突破。" }
    ],
    catalysts: [
      "国内晶圆厂扩产超预期",
      "设备国产化率持续提升",
      "新品类设备（如量测）取得突破"
    ],
    risks: [
      "下游资本开支周期性波动",
      "核心零部件仍依赖进口",
      "估值已包含较多乐观预期，业绩不及预期时回撤风险大"
    ],
    research: {
      oneLiner: "国产半导体设备平台型龙头，覆盖品类最全的「卖铲人」。",
      whyNotHigher: "估值已经price in较高的成长预期，多品类扩张能否持续兑现订单是关键，一旦扩产周期放缓，高PE很难维持。",
      sellTriggers: "下游晶圆厂资本开支明显放缓、新品类设备验证进度不及预期、或市值持续位于乐观区之上却无新订单验证。"
    },
    thesis: [
      "国产半导体设备品类最全的平台型公司",
      "受益于国内晶圆厂持续扩产",
      "设备国产化率仍有较大提升空间",
      "多品类协同有助于绑定核心客户"
    ],
    timeline: [
      { year: "2010", event: "深交所上市" },
      { year: "2017", event: "拓展清洗设备产品线" },
      { year: "2023", event: "刻蚀/薄膜设备批量导入头部晶圆厂" },
      { year: "2026（目标）", event: "平台化设备品类持续扩充" }
    ]
  },
  {
    code: "688012",
    name: "中微公司",
    industry: "半导体设备",
    mainBusiness: "国产刻蚀设备龙头，产品覆盖CCP/ICP刻蚀及MOCVD设备。",
    globalBenchmark: "Lam Research（泛林集团）",
    domesticReplacementRate: "★★★★☆",
    nationalStrategyLevel: "重点支持（刻蚀设备核心资产）",
    listingStatus: "listed",
    exchange: "科创板",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 361.59,
      totalShares: 6.67,
      floatShares: 6.1,
      calculatedMarketCap: null,
      reportedMarketCap: 2413,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 105,
      pb: 12.0,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 3000,
      safe: 4000,
      reasonable: 5600,
      optimistic: 8000,
      bubble: 11000,
      forecastProfitYear: 2028,
      forecastNetProfit: 80,
      reasonablePELow: 60,
      reasonablePEHigh: 75,
      baseFairValue: 5400,
      adjustmentFactor: 1.04,
      adjustedFairValue: 5616,
      anchorExplanation: "预测2028年净利润80亿元，给予60~75倍合理PE（刻蚀设备龙头，未来平台化扩张），基准合理市值约5400亿元，给予1.04倍小幅溢价，调整后约5616亿元。"
    },
    scores: [
      { name: "行业空间", score: 18, maxScore: 20, reason: "刻蚀设备国产化率提升空间大。" },
      { name: "竞争壁垒", score: 19, maxScore: 20, reason: "刻蚀设备技术壁垒高，客户认证周期长，先发优势明显。" },
      { name: "成长性", score: 18, maxScore: 20, reason: "平台化扩张至薄膜、量测等新品类。" },
      { name: "估值", score: 12, maxScore: 20, reason: "当前市值已接近合理区上沿。" },
      { name: "技术趋势", score: 18, maxScore: 20, reason: "先进制程刻蚀设备持续突破。" }
    ],
    catalysts: [
      "新品类设备（薄膜沉积、量测）放量",
      "先进制程刻蚀设备国产替代加速",
      "海外客户拓展"
    ],
    risks: [
      "估值弹性大，情绪退潮时回撤幅度较大",
      "研发投入持续加大，短期利润率承压",
      "地缘政治与出口管制不确定性"
    ],
    research: {
      oneLiner: "刻蚀设备国产龙头，技术壁垒最深的细分赛道之一。",
      whyNotHigher: "当前市值已接近合理区上沿，未来空间主要靠平台化扩张到薄膜、量测等新品类兑现，尚未充分验证。",
      sellTriggers: "新品类设备验证/放量明显低于预期、行业景气度快速回落、或市值大幅突破乐观锚却缺乏新增长曲线支撑。"
    },
    thesis: [
      "刻蚀设备技术壁垒最深，客户认证周期形成护城河",
      "先进制程国产替代加速带来订单增量",
      "平台化扩张至薄膜、量测等新品类打开第二曲线",
      "国家重点支持的核心设备资产"
    ],
    timeline: [
      { year: "2019", event: "科创板首批上市" },
      { year: "2021", event: "CCP刻蚀设备进入国际客户供应链验证" },
      { year: "2024", event: "MOCVD等新品类设备批量出货" },
      { year: "2026（推进中）", event: "薄膜沉积、量测等新品类平台化扩张" }
    ]
  },
  {
    code: "688041",
    name: "海光信息",
    industry: "国产CPU/GPU",
    mainBusiness: "国产x86兼容CPU与DCU（AI加速芯片）双轮驱动的信息技术企业。",
    globalBenchmark: "AMD",
    domesticReplacementRate: "★★★★☆",
    nationalStrategyLevel: "国家战略级（信创+AI芯片自主可控）",
    listingStatus: "listed",
    exchange: "科创板",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 291.05,
      totalShares: 41.7,
      floatShares: 33.8,
      calculatedMarketCap: null,
      reportedMarketCap: 12137,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 155,
      pb: 18.0,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 7000,
      safe: 9000,
      reasonable: 13000,
      optimistic: 18000,
      bubble: 24000,
      forecastProfitYear: 2028,
      forecastNetProfit: 90,
      reasonablePELow: 130,
      reasonablePEHigh: 150,
      baseFairValue: 12600,
      adjustmentFactor: 1.03,
      adjustedFairValue: 12978,
      anchorExplanation: "预测2028年净利润90亿元，给予130~150倍合理PE（信创+AI芯片双重稀缺性），基准合理市值约1.26万亿元，调整后约1.3万亿元。"
    },
    scores: [
      { name: "行业空间", score: 19, maxScore: 20, reason: "信创+AI算力国产化空间广阔。" },
      { name: "竞争壁垒", score: 16, maxScore: 20, reason: "CPU/GPU均为国产稀缺标的，但性能仍落后海外一线。" },
      { name: "成长性", score: 18, maxScore: 20, reason: "AI芯片需求快速释放，收入增速较快。" },
      { name: "估值", score: 10, maxScore: 20, reason: "当前PE已处于高位，price in较多远期预期。" },
      { name: "技术趋势", score: 16, maxScore: 20, reason: "DCU迭代速度快，但生态仍在建设中。" }
    ],
    catalysts: [
      "信创采购持续放量",
      "DCU新一代产品发布并放量",
      "国产算力自主可控政策支持"
    ],
    risks: [
      "估值处于高位，业绩不及预期时下行风险大",
      "先进制程代工受限，产能与良率存在不确定性",
      "AI芯片生态建设（软件适配）仍需时间"
    ],
    research: {
      oneLiner: "信创CPU + AI芯片DCU双轮驱动，国产算力稀缺标的。",
      whyNotHigher: "当前PE已处于高位，market已经price in较多远期预期；性能与生态相对海外一线仍有差距，兑现节奏是核心变量。",
      sellTriggers: "信创采购或DCU放量明显不及预期、先进制程代工受限导致产能瓶颈恶化、或估值大幅超越乐观锚而业绩未跟上。"
    },
    thesis: [
      "国产x86 CPU + AI芯片DCU双轮驱动，信创稀缺标的",
      "信创采购持续放量，收入能见度较高",
      "DCU受益于国产算力自主可控政策",
      "生态建设（软件适配）逐步成熟"
    ],
    timeline: [
      { year: "2022", event: "科创板上市" },
      { year: "2023", event: "海光三号CPU量产" },
      { year: "2024", event: "DCU二代产品发布" },
      { year: "2026（预期）", event: "DCU三代产品验证/放量" }
    ]
  },
  {
    code: "688256",
    name: "寒武纪",
    industry: "AI芯片",
    mainBusiness: "国产AI芯片设计企业，产品覆盖云端训练/推理加速卡。",
    globalBenchmark: "NVIDIA（英伟达）",
    domesticReplacementRate: "★★★☆☆",
    nationalStrategyLevel: "国家战略级（AI算力自主可控）",
    listingStatus: "listed",
    exchange: "科创板",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 1168.15,
      totalShares: 4.08,
      floatShares: 3.6,
      calculatedMarketCap: null,
      reportedMarketCap: 4766,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 280,
      pb: 45.0,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "PE/PB处于极高水平，主要反映远期AI算力预期而非当期盈利（此处PE/PB暂未随行情联动更新）。总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。"
    },
    anchors: {
      excellent: 9000,
      safe: 12000,
      reasonable: 16500,
      optimistic: 25000,
      bubble: 35000,
      forecastProfitYear: 2029,
      forecastNetProfit: 55,
      reasonablePELow: 250,
      reasonablePEHigh: 320,
      baseFairValue: 15675,
      adjustmentFactor: 1.05,
      adjustedFairValue: 16459,
      anchorExplanation: "预测2029年净利润55亿元，给予250~320倍合理PE（AI芯片高成长阶段普遍享受远期估值），基准合理市值约1.57万亿元，调整后约1.65万亿元。此估值高度依赖远期假设，波动风险大。"
    },
    scores: [
      { name: "行业空间", score: 20, maxScore: 20, reason: "AI算力需求想象空间最大。" },
      { name: "竞争壁垒", score: 14, maxScore: 20, reason: "与英伟达差距仍大，生态建设是关键变量。" },
      { name: "成长性", score: 18, maxScore: 20, reason: "收入从低基数快速增长。" },
      { name: "估值", score: 6, maxScore: 20, reason: "PE/PB极高，估值兑现压力大，属于高波动标的。" },
      { name: "技术趋势", score: 16, maxScore: 20, reason: "新一代芯片持续迭代，但量产验证仍需观察。" }
    ],
    catalysts: [
      "新一代AI芯片量产并放量",
      "国产大模型训练/推理需求持续释放",
      "软件生态（编译器/框架适配）加速成熟"
    ],
    risks: [
      "估值隐含极高的远期增长预期，兑现不及预期时回撤剧烈",
      "对单一大客户/订单依赖度较高",
      "先进制程代工受限，产能瓶颈"
    ],
    research: {
      oneLiner: "国产AI芯片想象空间最大的标的，对标英伟达的长期赛跑者。",
      whyNotHigher: "估值几乎完全建立在远期假设上，PE/PB处于极高水平，与英伟达的生态和性能差距仍然巨大，任何节奏放缓都会引发估值大幅回撤。",
      sellTriggers: "新一代芯片量产/生态建设明显不及预期、核心客户订单大幅低于预期、或市值持续处于泡沫区而无新的业绩验证。"
    },
    thesis: [
      "国产AI芯片想象空间最大的标的，对标英伟达赛道",
      "国产大模型训练/推理需求持续释放",
      "国家战略级支持AI算力自主可控",
      "新一代芯片持续迭代验证国产替代能力"
    ],
    timeline: [
      { year: "2020", event: "科创板上市" },
      { year: "2022", event: "思元370芯片发布" },
      { year: "2025", event: "新一代训练芯片流片" },
      { year: "2026（推进中）", event: "新一代芯片量产爬坡" }
    ]
  },
  {
    code: "300308",
    name: "中际旭创",
    industry: "AI光模块",
    mainBusiness: "全球领先的光模块供应商，产品覆盖800G/1.6T高速光模块。",
    globalBenchmark: "Coherent（II-VI）",
    domesticReplacementRate: "★★★★★（全球份额领先，非单纯国产替代逻辑）",
    nationalStrategyLevel: "受益于全球AI资本开支，非传统国产替代范畴",
    listingStatus: "listed",
    exchange: "深交所",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 955.0,
      totalShares: 10.37,
      floatShares: 9.5,
      calculatedMarketCap: null,
      reportedMarketCap: 9903,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 48,
      pb: 14.0,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 13000,
      safe: 16000,
      reasonable: 20000,
      optimistic: 26000,
      bubble: 34000,
      forecastProfitYear: 2028,
      forecastNetProfit: 300,
      reasonablePELow: 60,
      reasonablePEHigh: 70,
      baseFairValue: 19500,
      adjustmentFactor: 1.02,
      adjustedFairValue: 19890,
      anchorExplanation: "预测2028年净利润300亿元，给予60~70倍合理PE（全球AI算力核心卖铲人），基准合理市值约1.95万亿元，调整后约1.99万亿元。"
    },
    scores: [
      { name: "行业空间", score: 19, maxScore: 20, reason: "全球AI数据中心资本开支持续高增长。" },
      { name: "竞争壁垒", score: 18, maxScore: 20, reason: "全球市占率领先，客户结构优质（北美大厂）。" },
      { name: "成长性", score: 18, maxScore: 20, reason: "1.6T等新一代产品持续放量。" },
      { name: "估值", score: 15, maxScore: 20, reason: "估值反映高增长预期，但相对海外龙头仍有性价比。" },
      { name: "技术趋势", score: 17, maxScore: 20, reason: "光模块速率持续升级，技术迭代领先。" }
    ],
    catalysts: [
      "北美云厂商AI资本开支持续超预期",
      "1.6T光模块放量",
      "海外产能布局降低关税/地缘风险"
    ],
    risks: [
      "高度依赖少数海外大客户，订单集中度风险",
      "行业价格竞争激烈，毛利率存在波动",
      "全球AI资本开支若放缓，估值弹性回撤较大"
    ],
    research: {
      oneLiner: "全球AI算力核心「卖铲人」，光模块全球份额领先。",
      whyNotHigher: "高度依赖少数北美大客户，订单集中度高；一旦全球AI资本开支边际放缓，市场会迅速下修远期增速假设。",
      sellTriggers: "北美云厂商资本开支指引明显下修、客户集中度进一步恶化、或1.6T等新品放量大幅低于预期。"
    },
    thesis: [
      "全球AI算力核心卖铲人，市占率全球领先",
      "北美云厂商AI资本开支持续高增长",
      "1.6T等新一代产品持续放量",
      "海外产能布局降低关税与地缘风险"
    ],
    timeline: [
      { year: "2017", event: "深交所上市" },
      { year: "2020", event: "400G光模块规模化出货" },
      { year: "2023", event: "800G光模块放量" },
      { year: "2025", event: "1.6T光模块送样" },
      { year: "2026（推进中）", event: "1.6T光模块量产爬坡" }
    ]
  },
  {
    code: "300502",
    name: "新易盛",
    industry: "AI光模块",
    mainBusiness: "高速光模块供应商，受益于全球AI数据中心建设。",
    globalBenchmark: "Lumentum",
    domesticReplacementRate: "★★★★☆",
    nationalStrategyLevel: "受益于全球AI资本开支",
    listingStatus: "listed",
    exchange: "深交所",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 421.87,
      totalShares: 20.0,
      floatShares: 17.6,
      calculatedMarketCap: null,
      reportedMarketCap: 8437,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 52,
      pb: 15.0,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 8000,
      safe: 10000,
      reasonable: 13000,
      optimistic: 17000,
      bubble: 22000,
      forecastProfitYear: 2028,
      forecastNetProfit: 200,
      reasonablePELow: 60,
      reasonablePEHigh: 68,
      baseFairValue: 12800,
      adjustmentFactor: 1.0,
      adjustedFairValue: 12800,
      anchorExplanation: "预测2028年净利润200亿元，给予60~68倍合理PE，基准合理市值约1.28万亿元，暂不额外调整。"
    },
    scores: [
      { name: "行业空间", score: 18, maxScore: 20, reason: "AI光模块需求持续扩张。" },
      { name: "竞争壁垒", score: 16, maxScore: 20, reason: "行业竞争加剧，客户集中度较高。" },
      { name: "成长性", score: 17, maxScore: 20, reason: "受益于新一代产品放量。" },
      { name: "估值", score: 14, maxScore: 20, reason: "当前市值已低于合理区，具备一定安全垫。" },
      { name: "技术趋势", score: 16, maxScore: 20, reason: "跟随行业技术升级节奏。" }
    ],
    catalysts: [
      "新一代高速光模块放量",
      "客户结构进一步优化",
      "海外产能扩张降低贸易摩擦风险"
    ],
    risks: [
      "行业竞争激烈，价格与毛利率承压",
      "客户集中度较高，订单波动性大",
      "汇率及贸易政策变化风险"
    ],
    research: {
      oneLiner: "高速光模块供应商，受益于全球AI数据中心建设的第二梯队龙头。",
      whyNotHigher: "行业竞争激烈、客户集中度较高，相对中际旭创议价能力略弱，需要持续证明份额和毛利率的稳定性。",
      sellTriggers: "行业价格战加剧导致毛利率大幅下滑、核心客户订单流失、或市值大幅突破乐观锚而份额未同步提升。"
    },
    thesis: [
      "受益于全球AI数据中心建设的第二梯队光模块龙头",
      "新一代高速光模块持续放量",
      "客户结构逐步优化，降低集中度风险",
      "海外产能扩张对冲贸易摩擦"
    ],
    timeline: [
      { year: "2010", event: "深交所创业板上市" },
      { year: "2021", event: "400G光模块放量" },
      { year: "2024", event: "800G光模块放量" },
      { year: "2026（研发中）", event: "1.6T光模块研发与客户验证" }
    ]
  },
  {
    code: "601138",
    name: "工业富联",
    industry: "AI服务器",
    mainBusiness: "全球领先的AI服务器及精密制造ODM/EMS企业。",
    globalBenchmark: "Super Micro（美超微）",
    domesticReplacementRate: "★★★☆☆（全球代工龙头，非典型国产替代逻辑）",
    nationalStrategyLevel: "受益于全球AI资本开支",
    listingStatus: "listed",
    exchange: "上交所",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 68.27,
      totalShares: 200.0,
      floatShares: 190.0,
      calculatedMarketCap: null,
      reportedMarketCap: 13654,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 38,
      pb: 9.0,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 13000,
      safe: 16500,
      reasonable: 21000,
      optimistic: 27000,
      bubble: 35000,
      forecastProfitYear: 2028,
      forecastNetProfit: 480,
      reasonablePELow: 42,
      reasonablePEHigh: 46,
      baseFairValue: 21120,
      adjustmentFactor: 1.0,
      adjustedFairValue: 21120,
      anchorExplanation: "预测2028年净利润480亿元，给予42~46倍合理PE（AI服务器龙头，兼具规模与订单能见度），基准合理市值约2.11万亿元。"
    },
    scores: [
      { name: "行业空间", score: 19, maxScore: 20, reason: "全球AI服务器需求持续高速增长。" },
      { name: "竞争壁垒", score: 15, maxScore: 20, reason: "ODM/EMS环节议价能力相对有限。" },
      { name: "成长性", score: 18, maxScore: 20, reason: "受益于头部云厂商AI服务器订单持续释放。" },
      { name: "估值", score: 16, maxScore: 20, reason: "当前估值处于合理区间下沿，性价比尚可。" },
      { name: "技术趋势", score: 14, maxScore: 20, reason: "受制程与整机方案升级节奏影响。" }
    ],
    catalysts: [
      "头部云厂商AI服务器订单持续超预期",
      "液冷等新一代整机方案放量",
      "毛利率随高附加值产品占比提升"
    ],
    risks: [
      "ODM/EMS环节毛利率天花板相对较低",
      "客户集中度较高（少数大厂订单占比大）",
      "全球AI资本开支周期性波动"
    ],
    research: {
      oneLiner: "全球AI服务器ODM/EMS龙头，规模最大的整机集成商。",
      whyNotHigher: "ODM/EMS环节本质是代工，毛利率天花板相对较低，客户集中度高，议价能力有限，估值中枢很难对标设计端公司。",
      sellTriggers: "头部云厂商订单大幅缩减、毛利率持续下滑、或行业整体AI资本开支进入下行周期。"
    },
    thesis: [
      "全球AI服务器ODM/EMS规模最大的整机集成商",
      "头部云厂商AI服务器订单持续释放",
      "液冷等新一代整机方案提升附加值",
      "规模效应带来的成本优势"
    ],
    timeline: [
      { year: "2018", event: "上交所上市" },
      { year: "2022", event: "布局AI服务器业务" },
      { year: "2024", event: "AI服务器营收占比显著提升" },
      { year: "2026（推进中）", event: "液冷等新一代整机方案放量" }
    ]
  },
  {
    code: "300750",
    name: "宁德时代",
    industry: "动力电池",
    mainBusiness: "全球动力电池及储能系统龙头企业。",
    globalBenchmark: "LG新能源、三星SDI",
    domesticReplacementRate: "★★★★★（全球份额第一）",
    nationalStrategyLevel: "国家战略级（新能源产业链核心资产）",
    listingStatus: "listed",
    exchange: "深交所",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 388.0,
      totalShares: 44.2,
      floatShares: 42.0,
      calculatedMarketCap: null,
      reportedMarketCap: 17154,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 32,
      pb: 7.5,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 15000,
      safe: 18000,
      reasonable: 22000,
      optimistic: 28000,
      bubble: 35000,
      forecastProfitYear: 2028,
      forecastNetProfit: 700,
      reasonablePELow: 30,
      reasonablePEHigh: 33,
      baseFairValue: 22050,
      adjustmentFactor: 1.0,
      adjustedFairValue: 22050,
      anchorExplanation: "预测2028年净利润700亿元，给予30~33倍合理PE（全球动力电池绝对龙头），基准合理市值约2.2万亿元。"
    },
    scores: [
      { name: "行业空间", score: 18, maxScore: 20, reason: "全球电动化与储能需求持续增长，但增速放缓。" },
      { name: "竞争壁垒", score: 20, maxScore: 20, reason: "全球份额第一，技术与规模壁垒深厚。" },
      { name: "成长性", score: 15, maxScore: 20, reason: "行业进入中速增长阶段，成长性不及早期。" },
      { name: "估值", score: 17, maxScore: 20, reason: "估值处于合理区间，安全边际尚可。" },
      { name: "技术趋势", score: 16, maxScore: 20, reason: "新技术路线（固态电池等）持续布局。" }
    ],
    catalysts: [
      "储能业务占比持续提升",
      "海外产能扩张，全球份额进一步提升",
      "新一代电池技术商业化"
    ],
    risks: [
      "行业增速放缓，价格竞争加剧",
      "原材料价格波动影响毛利率",
      "海外地缘政治与关税政策风险"
    ],
    research: {
      oneLiner: "全球动力电池与储能绝对龙头，行业标准的制定者。",
      whyNotHigher: "行业已进入中速增长阶段，成长性不及早期，海外产能扩张和价格竞争压制毛利率弹性，估值中枢很难再显著上移。",
      sellTriggers: "全球电动化/储能需求增速大幅低于预期、价格战导致毛利率持续恶化、或海外关税政策大幅收紧。"
    },
    thesis: [
      "全球动力电池与储能绝对龙头，规模与技术壁垒深厚",
      "储能业务占比持续提升打开第二曲线",
      "海外产能扩张巩固全球份额",
      "新技术路线（固态电池等）保持领先布局"
    ],
    timeline: [
      { year: "2018", event: "深交所上市" },
      { year: "2020", event: "全球动力电池装机量跃居第一" },
      { year: "2023", event: "储能业务快速放量" },
      { year: "2026（布局中）", event: "全固态电池中试线推进" }
    ]
  },
  {
    code: "688120",
    name: "华海清科",
    industry: "半导体设备",
    mainBusiness: "国产CMP（化学机械抛光）设备龙头，并延伸至半导体再生晶圆及减薄设备。",
    globalBenchmark: "应用材料、荏原制作所",
    domesticReplacementRate: "★★★★☆",
    nationalStrategyLevel: "重点支持（CMP设备核心资产）",
    listingStatus: "listed",
    exchange: "科创板",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 244.6,
      totalShares: 5.9,
      floatShares: 4.8,
      calculatedMarketCap: null,
      reportedMarketCap: 1443,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 58,
      pb: 9.0,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 1200,
      safe: 1600,
      reasonable: 2200,
      optimistic: 3000,
      bubble: 4000,
      forecastProfitYear: 2028,
      forecastNetProfit: 30,
      reasonablePELow: 68,
      reasonablePEHigh: 78,
      baseFairValue: 2190,
      adjustmentFactor: 1.0,
      adjustedFairValue: 2190,
      anchorExplanation: "预测2028年净利润30亿元，给予68~78倍合理PE（CMP设备国产化率仍低，成长空间大），基准合理市值约2190亿元。"
    },
    scores: [
      { name: "行业空间", score: 18, maxScore: 20, reason: "CMP设备国产化率仍处早期，空间大。" },
      { name: "竞争壁垒", score: 16, maxScore: 20, reason: "国内CMP设备龙头，但全球竞争对手技术领先。" },
      { name: "成长性", score: 18, maxScore: 20, reason: "受益于晶圆厂扩产及再生晶圆业务放量。" },
      { name: "估值", score: 15, maxScore: 20, reason: "当前市值处于合理区下沿，具备一定安全垫。" },
      { name: "技术趋势", score: 15, maxScore: 20, reason: "新品类设备持续拓展中。" }
    ],
    catalysts: [
      "新品类设备（减薄、量测）放量",
      "再生晶圆业务规模扩大",
      "国产晶圆厂扩产持续"
    ],
    risks: [
      "市值体量小，股价波动性较大",
      "核心零部件仍依赖进口",
      "客户集中度较高"
    ],
    research: {
      oneLiner: "国产CMP设备龙头，半导体设备国产化里弹性较大的细分标的。",
      whyNotHigher: "市值体量小，全球竞争对手（应用材料、荏原）技术仍然领先，国产化率提升需要时间验证，波动性较大。",
      sellTriggers: "晶圆厂扩产大幅放缓、新品类设备验证不及预期、或核心零部件供应受限影响交付。"
    },
    thesis: [
      "国产CMP设备龙头，半导体设备国产化弹性标的",
      "再生晶圆业务打开第二成长曲线",
      "受益于国内晶圆厂持续扩产",
      "设备国产化率仍处早期，空间大"
    ],
    timeline: [
      { year: "2022", event: "科创板上市" },
      { year: "2023", event: "CMP设备国产份额持续提升" },
      { year: "2025", event: "再生晶圆业务规模扩大" },
      { year: "2026（验证中）", event: "减薄、量测等新品类设备客户验证" }
    ]
  },
  {
    code: "300567",
    name: "精测电子",
    industry: "半导体检测设备",
    mainBusiness: "面板检测设备起家，向半导体检测设备（存储/逻辑测试）延伸。",
    globalBenchmark: "KLA、爱德万测试",
    domesticReplacementRate: "★★★☆☆",
    nationalStrategyLevel: "重点支持（检测设备国产化）",
    listingStatus: "listed",
    exchange: "深交所",
    shareClass: "A股",
    currency: "CNY",
    valuationType: "ListedMarketCap",
    marketCapScope: "全部A股",
    marketFact: {
      price: 208.0,
      totalShares: 7.3,
      floatShares: 6.5,
      calculatedMarketCap: null,
      reportedMarketCap: 1518,
      marketCapMethod: "最新收盘价 × 总股本",
      peTTM: 62,
      pb: 7.0,
      asOfDate: "2026-08-06",
      sourceName: "东方财富（push2 API，延迟行情）",
      sourceUrl: "https://push2.eastmoney.com/",
      sourceNote: "总股本为此前整理的估算值，未逐一核实最新股本，市值仅供参考。PE/PB暂未随行情联动更新。"
    },
    anchors: {
      excellent: 700,
      safe: 950,
      reasonable: 1350,
      optimistic: 1900,
      bubble: 2600,
      forecastProfitYear: 2028,
      forecastNetProfit: 18,
      reasonablePELow: 70,
      reasonablePEHigh: 80,
      baseFairValue: 1350,
      adjustmentFactor: 1.0,
      adjustedFairValue: 1350,
      anchorExplanation: "预测2028年净利润18亿元，给予70~80倍合理PE（半导体检测设备国产化率低，弹性大），基准合理市值约1350亿元。"
    },
    scores: [
      { name: "行业空间", score: 17, maxScore: 20, reason: "半导体检测设备国产化率很低，空间巨大。" },
      { name: "竞争壁垒", score: 13, maxScore: 20, reason: "与KLA等海外龙头技术差距仍大。" },
      { name: "成长性", score: 17, maxScore: 20, reason: "受益于晶圆厂扩产及检测设备国产化提速。" },
      { name: "估值", score: 15, maxScore: 20, reason: "当前市值低于合理区，具备一定安全垫。" },
      { name: "技术趋势", score: 14, maxScore: 20, reason: "存储/逻辑检测设备持续验证中。" }
    ],
    catalysts: [
      "半导体检测设备国产化加速导入",
      "存储行业扩产带来检测设备需求",
      "面板主业企稳"
    ],
    risks: [
      "与海外龙头技术差距仍大，客户验证周期长",
      "面板主业景气度波动",
      "市值体量小，流动性与波动性风险"
    ],
    research: {
      oneLiner: "半导体检测设备国产化率最低的细分赛道之一，弹性标的。",
      whyNotHigher: "与KLA等海外龙头技术差距仍大，客户验证周期长，面板主业景气度波动拖累整体估值中枢。",
      sellTriggers: "半导体检测设备验证进度大幅低于预期、面板主业持续恶化、或市值大幅突破乐观锚而订单未跟上。"
    },
    thesis: [
      "半导体检测设备国产化率最低的细分赛道之一",
      "受益于晶圆厂扩产带来的检测设备需求",
      "面板主业提供基本盘现金流",
      "存储/逻辑检测设备国产化加速导入"
    ],
    timeline: [
      { year: "2016", event: "创业板上市" },
      { year: "2020", event: "切入半导体检测设备领域" },
      { year: "2024", event: "存储测试设备通过客户验证" },
      { year: "2026（送样中）", event: "逻辑芯片检测设备客户送样" }
    ]
  }
];

/* ============================================================
 * 产业地图（Industry Map）
 * 按赛道/子赛道对公司分组，供"产业地图"页面做树状下钻展示。
 * 每个叶子节点里的 code 对应 COMPANIES 里的 code；globalPeer 是该
 * 子赛道对应的全球代表公司（不一定在本站数据库中）。
 * ============================================================ */
const INDUSTRY_TREE = [
  {
    name: "AI 算力",
    children: [
      {
        name: "AI芯片 / GPU",
        globalPeers: ["NVIDIA", "AMD"],
        codes: ["688256", "688041"]
      },
      {
        name: "存储 / HBM",
        globalPeers: ["SK海力士", "美光"],
        codes: ["688825"]
      },
      {
        name: "半导体设备",
        globalPeers: ["Applied Materials", "Lam Research", "荏原制作所"],
        codes: ["002371", "688012", "688120", "300567"]
      },
      {
        name: "晶圆代工",
        globalPeers: ["台积电"],
        codes: ["688981"]
      },
      {
        name: "AI光模块 / 光通信",
        globalPeers: ["Coherent", "Lumentum"],
        codes: ["300308", "300502"]
      },
      {
        name: "AI服务器",
        globalPeers: ["Super Micro"],
        codes: ["601138"]
      }
    ]
  },
  {
    name: "新能源",
    children: [
      {
        name: "动力电池 / 储能",
        globalPeers: ["LG新能源", "三星SDI", "松下"],
        codes: ["300750"]
      }
    ]
  }
];

/* ============================================================
 * 全球科技地图（Global Tech Map）
 * 按"美国 / 台湾 / 韩国 → 中国"的技术流向关系组织，
 * 每个海外节点关联对应的中国标的 code，供 global.html 做
 * 层级式世界地图展示与点击跳转。
 * ============================================================ */
const GLOBAL_MAP = {
  upstream: [
    {
      country: "美国",
      companies: [
        { name: "NVIDIA", segment: "AI GPU", relatedCodes: ["688256"] },
        { name: "AMD", segment: "CPU/GPU", relatedCodes: ["688041"] },
        { name: "Broadcom", segment: "AI芯片/网络", relatedCodes: ["688256"] },
        { name: "Applied Materials", segment: "半导体设备", relatedCodes: ["002371"] },
        { name: "Lam Research", segment: "刻蚀设备", relatedCodes: ["688012"] },
        { name: "Coherent", segment: "光模块", relatedCodes: ["300308"] },
        { name: "Lumentum", segment: "光模块", relatedCodes: ["300502"] },
        { name: "Super Micro", segment: "AI服务器", relatedCodes: ["601138"] }
      ]
    },
    {
      country: "台湾",
      companies: [
        { name: "台积电 TSMC", segment: "晶圆代工", relatedCodes: ["688981"] }
      ]
    },
    {
      country: "韩国",
      companies: [
        { name: "SK海力士", segment: "DRAM/HBM", relatedCodes: ["688825"] },
        { name: "三星电子", segment: "DRAM/晶圆代工", relatedCodes: ["688825", "688981"] },
        { name: "LG新能源", segment: "动力电池", relatedCodes: ["300750"] },
        { name: "三星SDI", segment: "动力电池", relatedCodes: ["300750"] }
      ]
    }
  ],
  china: [
    "688825", "688981", "002371", "688012", "688041", "688256",
    "300308", "300502", "601138", "300750", "688120", "300567"
  ]
};

/* ---------------- 工具函数 ---------------- */

// 现场计算市值：price × totalShares（规则2）
function calcMarketCap(price, totalShares) {
  if (price == null || totalShares == null) return null;
  return Math.round(price * totalShares * 10) / 10;
}

// 锚点市值 → 对应股价：anchor(亿元) / totalShares(亿股) = 元/股，单位天然抵消
function anchorPrice(anchorMarketCap, totalShares) {
  if (anchorMarketCap == null || totalShares == null || totalShares === 0) return null;
  return Math.round((anchorMarketCap / totalShares) * 100) / 100;
}

/* ============================================================
 * 实时/手动股价覆盖层（本地存储，跨页面共用）
 * ------------------------------------------------------------
 * 说明（对用户透明）：
 * 本站是零后端静态网站，本身没有服务器去连接行情源。
 * 这里提供两种方式让"当前股价"不必永远停留在示例数据：
 *  1. 手动更新：用户在公司详情页手动输入最新股价，保存到浏览器
 *     本地存储(localStorage)，之后市值/区间/安全边际会立刻用新
 *     价格重新计算。只在当前浏览器生效，不跨设备同步。
 *  2. 尝试自动获取：页面会尝试用 <script> 标签的方式请求新浪/腾讯
 *     的公开股票行情接口（历史上前端股票工具常用的技术，绕开
 *     CORS限制）。这类接口不保证在所有网络环境下都能访问（例如
 *     云端/海外网络环境可能被限制或超时），失败时会明确提示，
 *     不会静默展示假数据。
 * ============================================================ */
const LS_LIVE_PRICE = "hcr_live_price_v1";

function _lsGetSafe(key, fallback) {
  try {
    if (typeof localStorage === "undefined") return fallback;
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error("读取本地存储失败：", key, e);
    return fallback;
  }
}
function _lsSetSafe(key, value) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error("写入本地存储失败：", key, e);
  }
}

// 读取某公司的本地覆盖股价：{ price, updatedAt, source } 或 null
function getLivePrice(code) {
  const all = _lsGetSafe(LS_LIVE_PRICE, {});
  return all[code] || null;
}
// 写入/更新某公司的本地覆盖股价，source: "manual" | "sina" | "gtimg"
function setLivePrice(code, price, source) {
  if (price == null || isNaN(price) || price <= 0) return false;
  const all = _lsGetSafe(LS_LIVE_PRICE, {});
  all[code] = { price: Number(price), updatedAt: new Date().toISOString(), source: source || "manual" };
  _lsSetSafe(LS_LIVE_PRICE, all);
  return true;
}
// 清除覆盖股价，恢复展示示例数据
function clearLivePrice(code) {
  const all = _lsGetSafe(LS_LIVE_PRICE, {});
  delete all[code];
  _lsSetSafe(LS_LIVE_PRICE, all);
}

// 顺序校验：excellent < safe < reasonable < optimistic < bubble（规则5）
function validateAnchors(c) {
  const a = c.anchors;
  const seq = [
    ["极佳机会锚", a.excellent],
    ["安全锚", a.safe],
    ["合理锚", a.reasonable],
    ["乐观锚", a.optimistic],
    ["泡沫锚", a.bubble]
  ];
  for (let i = 1; i < seq.length; i++) {
    if (!(seq[i - 1][1] < seq[i][1])) {
      throw new Error(
        `[锚点校验失败] ${c.name}(${c.code})：${seq[i - 1][0]}(${seq[i - 1][1]}) 应严格小于 ${seq[i][0]}(${seq[i][1]})，请检查 data.js`
      );
    }
  }
}

// 自动判断当前估值区间（规则6，禁止在数据里人工写死状态）
function computeZone(marketCap, anchors) {
  if (marketCap == null) return { key: "unknown", label: "暂无行情", color: "var(--zone-unknown)" };
  if (marketCap <= anchors.excellent) return { key: "excellent", label: "极佳机会", color: "var(--zone-excellent)" };
  if (marketCap <= anchors.safe) return { key: "safe", label: "安全区", color: "var(--zone-safe)" };
  if (marketCap <= anchors.reasonable) return { key: "reasonable", label: "合理区", color: "var(--zone-reasonable)" };
  if (marketCap <= anchors.optimistic) return { key: "optimistic", label: "乐观区", color: "var(--zone-optimistic)" };
  return { key: "bubble", label: "偏贵/泡沫区", color: "var(--zone-bubble)" };
}

// 安全边际 = (合理锚 - 当前市值) / 合理锚，允许负数（规则7）
function safetyMargin(marketCap, reasonable) {
  if (marketCap == null) return null;
  return (reasonable - marketCap) / reasonable;
}

// 评分自动求和（规则9）
function totalScore(c) {
  return c.scores.reduce((s, i) => s + i.score, 0);
}
function totalMaxScore(c) {
  return c.scores.reduce((s, i) => s + i.maxScore, 0);
}

// 金额格式化：>=10000亿 显示为 X.XX万亿
function formatYi(v) {
  if (v == null || isNaN(v)) return "—";
  if (Math.abs(v) >= 10000) return (v / 10000).toFixed(2) + "万亿";
  return Math.round(v * 10) / 10 + "亿";
}
function formatPct(v) {
  if (v == null || isNaN(v)) return "—";
  return (v * 100).toFixed(1) + "%";
}

// 给每家公司挂上现场计算好的市值与区间信息，供页面直接使用
// 若浏览器本地存有用户手动/自动更新的股价（见 getLivePrice），
// 优先用该价格现场重算市值，而不是永远使用示例数据里的price。
function enrichCompany(c) {
  const live = getLivePrice(c.code);
  const effectivePrice = (live && live.price != null) ? live.price : c.marketFact.price;
  const marketCap = (c.marketFact.calculatedMarketCap != null && !live)
    ? c.marketFact.calculatedMarketCap
    : calcMarketCap(effectivePrice, c.marketFact.totalShares);
  const zone = computeZone(marketCap, c.anchors);
  const margin = safetyMargin(marketCap, c.anchors.reasonable);
  const a = c.anchors;
  const ts = c.marketFact.totalShares;
  return {
    ...c,
    computed: {
      marketCap,
      zone,
      safetyMargin: margin,
      score: totalScore(c),
      maxScore: totalMaxScore(c),
      effectivePrice,
      priceIsLive: !!live,
      liveInfo: live,
      anchorPrices: {
        excellent: anchorPrice(a.excellent, ts),
        safe: anchorPrice(a.safe, ts),
        reasonable: anchorPrice(a.reasonable, ts),
        optimistic: anchorPrice(a.optimistic, ts),
        bubble: anchorPrice(a.bubble, ts)
      }
    }
  };
}

// 启动时立即做顺序校验，任何一家出错都会在控制台抛出异常（规则5）
COMPANIES.forEach(validateAnchors);

// 导出（供各页面脚本直接使用全局变量）
// 用 const 声明数组本身（引用不变），但内容可通过 refreshEnrichedData()
// 原地替换——这样其它文件里 `COMPANIES_ENRICHED.find(...)` 之类的引用
// 在用户更新股价后无需重新加载页面即可拿到最新计算结果。
const COMPANIES_ENRICHED = COMPANIES.map(enrichCompany);
const INDUSTRIES = Array.from(new Set(COMPANIES.map(c => c.industry)));

// 在用户更新/清除本地覆盖股价后调用：重新计算全部公司并原地刷新数组
function refreshEnrichedData() {
  const fresh = COMPANIES.map(enrichCompany);
  COMPANIES_ENRICHED.splice(0, COMPANIES_ENRICHED.length, ...fresh);
  return COMPANIES_ENRICHED;
}
