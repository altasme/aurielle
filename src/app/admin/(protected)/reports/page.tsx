import { getBusinessLineReport, getCustomerInsights, getLeadsSnapshot } from "@/lib/admin/reports";
import { resolveReportRange, percentDelta, type ReportRangePreset } from "@/lib/admin/report-ranges";
import type { BusinessLine } from "@/lib/admin/orders";
import { formatMoney } from "@/lib/format-money";
import { StatTile } from "@/components/admin/stat-tile";
import { BarList } from "@/components/admin/bar-list";
import { RevenueTrendChart } from "@/components/admin/revenue-trend-chart";
import { BusinessLineTabs, ReportRangeTabs } from "@/components/admin/report-filters";

type UrlCategory = "collection" | "atelier-supply";

const CATEGORY_TO_BUSINESS_LINE: Record<UrlCategory, BusinessLine> = {
  collection: "collection",
  "atelier-supply": "atelier_supply",
};

function buildHref(category: UrlCategory, range: ReportRangePreset): string {
  return `/admin/reports?category=${category}&range=${range}`;
}

const count = (n: number) => n.toLocaleString("en-US");

export default async function AdminReportsPage({ searchParams }: PageProps<"/admin/reports">) {
  const params = await searchParams;
  const categoryParam = Array.isArray(params.category) ? params.category[0] : params.category;
  const category: UrlCategory = categoryParam === "atelier-supply" ? "atelier-supply" : "collection";
  const businessLine = CATEGORY_TO_BUSINESS_LINE[category];

  const rangeParam = Array.isArray(params.range) ? params.range[0] : params.range;
  const range = resolveReportRange(rangeParam);

  const [report, customers, leads] = await Promise.all([
    getBusinessLineReport(businessLine, range),
    getCustomerInsights(businessLine),
    getLeadsSnapshot(range),
  ]);

  const money = (amount: number) => formatMoney(report.currency, amount);
  const revenueDelta = percentDelta(report.confirmedRevenue, report.previousConfirmedRevenue);
  const discountRate = report.grossSales > 0 ? (report.discountsGiven / report.grossSales) * 100 : 0;

  return (
    <div>
      <h1 className="font-serif text-2xl text-ink">Reports &amp; Analytics</h1>
      <p className="mt-1 text-sm text-ink/60">
        Confirmed revenue counts orders once payment is verified paid -- not just placed -- so these numbers reflect
        money actually collected, not gross cart value.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="New Inquiries" value={count(leads.contactInquiries + leads.businessInquiries)} hint={`${range.label} · Contact + Business`} />
        <StatTile label="Studio Quote Requests" value={count(leads.studioInquiries)} hint={range.label} />
        <StatTile label="Affiliate Applications" value={count(leads.affiliateApplications)} hint={range.label} />
        <StatTile label="Total Leads" value={count(leads.totalLeads)} hint={`${range.label} · sitewide`} />
      </div>

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <BusinessLineTabs
          collectionHref={buildHref("collection", range.preset)}
          atelierHref={buildHref("atelier-supply", range.preset)}
          active={businessLine}
        />
        <ReportRangeTabs active={range.preset} buildHref={(preset) => buildHref(category, preset)} />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-3">
        <StatTile
          label="Confirmed Revenue"
          value={money(report.confirmedRevenue)}
          delta={{ percent: revenueDelta, comparedTo: "prior period", positiveIsGood: true }}
        />
        <StatTile label="Orders Placed" value={count(report.ordersPlaced)} hint={`${report.paidOrders} paid`} />
        <StatTile label="Average Order Value" value={report.paidOrders > 0 ? money(report.averageOrderValue) : "—"} />
        <StatTile
          label="Pending Verification"
          value={money(report.pendingValue)}
          hint={`${count(report.pendingCount)} order${report.pendingCount === 1 ? "" : "s"} awaiting payment confirmation`}
        />
        <StatTile
          label="Discounts Given"
          value={money(report.discountsGiven)}
          hint={report.grossSales > 0 ? `${discountRate.toFixed(1)}% of gross sales` : undefined}
        />
        <StatTile
          label="Cancelled"
          value={money(report.cancelledValue)}
          hint={`${count(report.cancelledCount)} order${report.cancelledCount === 1 ? "" : "s"}`}
        />
      </div>
      {report.otherCurrencies.length > 0 && (
        <p className="mt-3 text-xs text-ink/40">
          Also received in this period, kept separate from the totals above:{" "}
          {report.otherCurrencies.map((c) => formatMoney(c.currency, c.amount)).join(", ")}.
        </p>
      )}

      <section className="mt-10">
        <h2 className="font-serif text-lg text-ink">Revenue Trend</h2>
        <p className="mt-1 text-xs text-ink/50">Confirmed (paid) revenue, {report.currency}.</p>
        <div className="mt-4 border border-taupe/20 bg-white p-5">
          <RevenueTrendChart points={report.revenueTrend} currency={report.currency} />
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-lg text-ink">Order Status</h2>
          <div className="mt-4 border border-taupe/20 bg-white p-5">
            <BarList
              items={report.orderStatusCounts.map((s) => ({ label: s.label, value: s.count }))}
              formatValue={count}
            />
          </div>
        </section>
        <section>
          <h2 className="font-serif text-lg text-ink">Payment Status</h2>
          <div className="mt-4 border border-taupe/20 bg-white p-5">
            <BarList
              items={report.paymentStatusCounts.map((s) => ({ label: s.label, value: s.count }))}
              formatValue={count}
            />
          </div>
        </section>
      </div>

      <section className="mt-10">
        <h2 className="font-serif text-lg text-ink">Top Products</h2>
        <p className="mt-1 text-xs text-ink/50">By net revenue (after promotions), {report.currency}.</p>
        <div className="mt-4 overflow-x-auto border border-taupe/20 bg-white">
          <table className="w-full min-w-[600px] text-left text-sm">
            <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Units Sold</th>
                <th className="px-4 py-3">Revenue</th>
              </tr>
            </thead>
            <tbody>
              {report.topProducts.map((p) => (
                <tr key={p.slug} className="border-b border-taupe/10 last:border-0">
                  <td className="px-4 py-3 text-ink">{p.name}</td>
                  <td className="px-4 py-3 text-ink/70">{count(p.unitsSold)}</td>
                  <td className="px-4 py-3 text-ink/70">{money(p.revenue)}</td>
                </tr>
              ))}
              {report.topProducts.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-4 py-8 text-center text-sm text-ink/40">
                    No paid orders in this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-lg text-ink">Product Promotions Performance</h2>
          <p className="mt-1 text-xs text-ink/50">Auto-applied promotions used in paid orders this period.</p>
          <div className="mt-4 overflow-x-auto border border-taupe/20 bg-white">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-3">Promotion</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Discount Given</th>
                </tr>
              </thead>
              <tbody>
                {report.promotionPerformance.map((p) => (
                  <tr key={p.id} className="border-b border-taupe/10 last:border-0">
                    <td className="px-4 py-3 text-ink">{p.name}</td>
                    <td className="px-4 py-3 text-ink/70">{count(p.ordersUsed)}</td>
                    <td className="px-4 py-3 text-ink/70">{money(p.discountGiven)}</td>
                  </tr>
                ))}
                {report.promotionPerformance.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-ink/40">
                      No promotion usage in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">Discount Codes Performance</h2>
          <p className="mt-1 text-xs text-ink/50">Codes redeemed in paid orders this period.</p>
          <div className="mt-4 overflow-x-auto border border-taupe/20 bg-white">
            <table className="w-full min-w-[420px] text-left text-sm">
              <thead className="border-b border-taupe/20 bg-beige/40 text-xs uppercase tracking-wide text-ink/60">
                <tr>
                  <th className="px-4 py-3">Code</th>
                  <th className="px-4 py-3">Orders</th>
                  <th className="px-4 py-3">Discount Given</th>
                </tr>
              </thead>
              <tbody>
                {report.discountCodePerformance.map((c) => (
                  <tr key={c.id} className="border-b border-taupe/10 last:border-0">
                    <td className="px-4 py-3 text-ink">
                      {c.code}
                      <div className="text-xs text-ink/50">{c.name}</div>
                    </td>
                    <td className="px-4 py-3 text-ink/70">{count(c.ordersUsed)}</td>
                    <td className="px-4 py-3 text-ink/70">{money(c.discountGiven)}</td>
                  </tr>
                ))}
                {report.discountCodePerformance.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-sm text-ink/40">
                      No discount code usage in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-2">
        <section>
          <h2 className="font-serif text-lg text-ink">Orders by Country</h2>
          <div className="mt-4 border border-taupe/20 bg-white p-5">
            <BarList
              items={report.geography.map((g) => ({ label: g.country, value: g.revenue, sublabel: `${count(g.orders)} order${g.orders === 1 ? "" : "s"}` }))}
              formatValue={money}
            />
          </div>
        </section>

        <section>
          <h2 className="font-serif text-lg text-ink">Customer Insights</h2>
          <p className="mt-1 text-xs text-ink/50">All-time, {customers.currency} customers of this business line.</p>
          <div className="mt-4 border border-taupe/20 bg-white p-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink/50">Repeat Customers</p>
                <p className="mt-1 text-xl font-semibold text-ink">
                  {(customers.repeatRate * 100).toFixed(0)}%
                </p>
                <p className="text-xs text-ink/40">
                  {count(customers.repeatCustomers)} of {count(customers.totalCustomers)} customers ordered more than once
                </p>
              </div>
            </div>
            {customers.topCustomers.length > 0 && (
              <div className="mt-5 border-t border-taupe/10 pt-4">
                <p className="text-xs uppercase tracking-wide text-ink/50">Top Customers by Lifetime Spend</p>
                <ul className="mt-2 space-y-2">
                  {customers.topCustomers.map((c) => (
                    <li key={c.email} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="truncate text-ink/80">
                        {c.name} <span className="text-xs text-ink/40">({count(c.orders)} orders)</span>
                      </span>
                      <span className="shrink-0 tabular-nums text-ink/60">{formatMoney(customers.currency, c.totalSpent)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
