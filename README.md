# 海外仓系统 前端原型（wms-prototype）

海外仓系统（WMS）前端原型工程：Vue 3.5 + Vite 5 + Element Plus 2.8 + Pinia + Vue Router 4 + Vue I18n 9，**Mock 数据全内置、无后端依赖**。

需求基准：`E:/code/qmsandbox/.project/prds/overseas-warehouse-wms-prd.md`（重点第 5/6 章页面明细、第 11 章状态机、附录 A 实测样例——仓库"威汇赢韩国仓"、账号 SHEN/VIP0157、单号 RK/CK/HB/TH/ZD + 日期 + 流水、交货方式"自发头程/中转代发"）。

## 启动方式

```bash
npm install        # 首次
npm run dev        # 开发（http://localhost:5173，hash 路由）
npm run build      # 生产构建（产物 dist/）
npm run preview    # 本地预览构建产物
```

演示账号：**SHEN / 123456**（主账号）、**VIP0157 / 123456**（演示多租户数据隔离）。登录需输入图形验证码（mock，点击可刷新）；"12小时内免登录"勾选后会话保持 12 小时。

## 目录结构

```text
wms-prototype/
├─ index.html / vite.config.js / package.json
└─ src/
   ├─ main.js / App.vue               # 入口：Pinia/Router/i18n/ElementPlus + 全局图标注册
   ├─ router/index.js                 # 31 条路由（含 props.mode 复用）+ 登录守卫 + 标题
   ├─ layout/MainLayout.vue           # 主框架：8 模块菜单树 / 面包屑 / 多标签 Tab / 消息中心 / 语言切换 / 用户下拉
   ├─ components/
   │  ├─ ProTable.vue                 # 通用列表封装：筛选区 + 工具条插槽 + 表格(多选/排序) + 分页 + 导出
   │  └─ ProductPicker.vue            # "选择产品"弹窗（仅已审核+启用；出库/换标带实时库存与 FnSku 列）
   ├─ api/index.js                    # Mock 查询/写入封装：分页/筛选/排序真实生效，按登录用户隔离数据
   ├─ mock/
   │  ├─ data.js                      # 基础数据（用户/仓库/产品/库存/店铺/平台订单/映射）+ 业务单据（入库/认领/出库/换标/退货/流水/账单/银行账户/消息）
   │  └─ code.js                      # 单号生成：前缀 + yyyyMMddHHmmss + 3位流水（RK/CK/HB/TH/ZD）
   ├─ store/
   │  ├─ user.js                      # 登录态（localStorage，12h 免登录 / 1h 会话过期）
   │  └─ tabs.js                      # 多标签页工作区状态
   ├─ utils/（status.js 状态机映射 / format.js 金额·脱敏·Excel导出 / i18n.js 取值兜底）
   ├─ locales/（zh.js / en.js / index.js）
   └─ views/
      ├─ login/Login.vue
      ├─ shop/（ShopOrder / ShopAuthorize / SkuMapping）
      ├─ basic/ProductManage.vue
      ├─ inbound/（ClaimManage / InboundCreate / InboundList[mode]）
      ├─ outbound/（OutboundCreate / OutboundList[mode]）
      ├─ rebrand/（RebrandCreate / RebrandList[mode]）
      ├─ return/（ReturnCreate / ReturnList[mode]）
      ├─ stock/（StockDetail / StockInquiry）
      ├─ finance/（BankInfo / Payment）
      └─ profile/Profile.vue
```

## 页面覆盖清单（31 路由 → 组件文件）

| # | 菜单模块 | 路由 | 组件文件 |
| --- | --- | --- | --- |
| 1 | — | /login | src/views/login/Login.vue |
| 2 | 我的店铺 | /shop/order | src/views/shop/ShopOrder.vue |
| 3 | 我的店铺 | /shop/authorize | src/views/shop/ShopAuthorize.vue |
| 4 | 我的店铺 | /shop/sku_mapping | src/views/shop/SkuMapping.vue |
| 5 | 基本信息 | /basic/product | src/views/basic/ProductManage.vue |
| 6 | 入库管理 | /inbound/claim | src/views/inbound/ClaimManage.vue |
| 7 | 入库管理 | /inbound/create | src/views/inbound/InboundCreate.vue |
| 8 | 入库管理 | /inbound/pickup | src/views/inbound/InboundList.vue（props.mode='pickup'） |
| 9 | 入库管理 | /inbound/confirm | src/views/inbound/InboundList.vue（props.mode='confirm'） |
| 10 | 入库管理 | /inbound/all | src/views/inbound/InboundList.vue（props.mode='all'） |
| 11 | 一件代发 | /outbound/create | src/views/outbound/OutboundCreate.vue |
| 12 | 一件代发 | /outbound/outbound-djh | src/views/outbound/OutboundList.vue（props.mode='djh'） |
| 13 | 一件代发 | /outbound/outbound-dfh | src/views/outbound/OutboundList.vue（props.mode='dfh'） |
| 14 | 一件代发 | /outbound/outbound-yfh | src/views/outbound/OutboundList.vue（props.mode='yfh'） |
| 15 | 一件代发 | /outbound/outbound-all | src/views/outbound/OutboundList.vue（props.mode='all'） |
| 16 | 换标管理 | /fbarebrand/create | src/views/rebrand/RebrandCreate.vue |
| 17 | 换标管理 | /fbarebrand/rebrand-djh | src/views/rebrand/RebrandList.vue（props.mode='djh'） |
| 18 | 换标管理 | /fbarebrand/rebrand-dtb | src/views/rebrand/RebrandList.vue（props.mode='dtb'） |
| 19 | 换标管理 | /fbarebrand/rebrand-dfh | src/views/rebrand/RebrandList.vue（props.mode='dfh'） |
| 20 | 换标管理 | /fbarebrand/rebrand-yfh | src/views/rebrand/RebrandList.vue（props.mode='yfh'） |
| 21 | 退货管理 | /return/create | src/views/return/ReturnCreate.vue |
| 22 | 退货管理 | /return/return-dlh | src/views/return/ReturnList.vue（props.mode='dlh'） |
| 23 | 退货管理 | /return/return-dsj | src/views/return/ReturnList.vue（props.mode='dsj'） |
| 24 | 退货管理 | /return/return-dcl | src/views/return/ReturnList.vue（props.mode='dcl'） |
| 25 | 退货管理 | /return/return-dwc | src/views/return/ReturnList.vue（props.mode='dwc'） |
| 26 | 退货管理 | /return/return-ywc | src/views/return/ReturnList.vue（props.mode='ywc'） |
| 27 | 库存管理 | /stock/stock-detail | src/views/stock/StockDetail.vue |
| 28 | 库存管理 | /stock/inquiry | src/views/stock/StockInquiry.vue |
| 29 | 财务中心 | /finance/bankInfo | src/views/finance/BankInfo.vue |
| 30 | 财务中心 | /finance/payment | src/views/finance/Payment.vue |
| 31 | 个人设置 | /profile | src/views/profile/Profile.vue |

> 列表页（#2~#30）全部基于 `components/ProTable.vue` 配置化实现，页面本身只负责声明筛选/列配置与业务动作。

## Mock 说明

- **数据源**：`src/mock/data.js`。内存态数组，刷新页面后重置为种子数据；写操作（新增单据/审核/打印/支付/认领等）直接修改数组，会话内可见。
- **查询封装**：`src/api/index.js`。所有查询返回 Promise，分页（默认 10 条/页）、多关键字逗号筛选、模糊匹配、日期区间、列排序真实生效；**数据隔离**：查询自动按当前登录"用户名"过滤（认领无主货除外）。
- **单号规则**（PRD 10.3，`src/mock/code.js`）：入库 `RK`、出库订单 `CK`、换标 `HB`、退货 `TH`、账单 `ZD`、发货单号 `FH`，均为 `前缀 + yyyyMMddHHmmss + 3位流水`。
- **业务闭环演示**：
  - 店铺订单"审核"→ 未映射订单拦截；通过后自动生成一件代发出库单（出现在"待下架"）；
  - 出库"打印"→ 面单打印状态 未打印→已打印；已出货页"更多"含补打面单/物流轨迹（mock 提示）；
  - 认领管理"认领"→ 生成本人入库单并进入"待确认"；
  - 出库/换标提交时校验并预占库存（可库库存 = 在库 − 预占），超卖拦截；
  - 账单"批量支付"→ 仅"待支付"生效；银行账号脱敏展示（保留后 4 位）。
- **导出**：列表"导出"遵循当前筛选条件，生成 .xls（列名与页面一致；入库导出将时间列展开为创建/揽收/上架三列；"待下架"页支持"导出打单数据"）。
- **i18n**：中/英双语，顶部"语言"切换；文案经 `utils/i18n.js` 的 `tl(key, 中文兜底)` 输出，杜绝漏翻 key 直接上屏（PRD G-04）。
