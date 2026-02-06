import { createClient } from "@/lib/supabase/server";
import DashboardContent from "@/components/DashboardContent";

export const revalidate = 0;

async function fetchStats() {
  const supabase = createClient();
  const [
    { data: orders },
    { data: revenue },
    { data: lowStock },
    { data: recent },
    { data: allOrders },
    { data: statusCounts },
  ] = await Promise.all([
    supabase.from("orders").select("id", { count: "exact" }),
    supabase
      .rpc("store_revenue_stats")
      .then((r) => r)
      .catch(async () => {
        const { data } = await supabase.from("orders").select("total_price");
        const total = (data || []).reduce(
          (s, o) => s + (o.total_price || 0),
          0,
        );
        return { data: { total } };
      }),
    supabase.from("products").select("id,stock").lt("stock", 5).limit(5),
    supabase
      .from("orders")
      .select("id,status,created_at,total_price")
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("orders")
      .select("created_at,total_price")
      .order("created_at", { ascending: true })
      .limit(30),
    supabase.from("orders").select("status"),
  ]);

  const revenueTrend = (allOrders || [])
    .reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
      const existing = acc.find((item) => item.date === date);
      if (existing) {
        existing.revenue += order.total_price || 0;
      } else {
        acc.push({ date, revenue: order.total_price || 0 });
      }
      return acc;
    }, [])
    .slice(-7);

  const statusDistribution = (statusCounts || []).reduce((acc, order) => {
    const status = order.status || "pending";
    const existing = acc.find((item) => item.name === status);
    if (existing) {
      existing.value += 1;
    } else {
      acc.push({ name: status, value: 1 });
    }
    return acc;
  }, []);

  return {
    ordersCount: orders?.length ?? 0,
    revenue: revenue?.data?.total ?? 0,
    lowStock: lowStock ?? [],
    recent: recent ?? [],
    revenueTrend,
    statusDistribution,
  };
}

export default async function DashboardPage() {
  const stats = await fetchStats();
  return <DashboardContent stats={stats} />;
}
