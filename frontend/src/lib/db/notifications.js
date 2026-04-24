import { supabase } from "@/lib/supabase";

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export async function getNotifications() {
  const today = new Date().toISOString().split("T")[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const threeDaysLater = new Date(Date.now() + 3 * 86400000).toISOString().split("T")[0];

  const [
    { data: overdueTasks },
    { data: recentDocs },
    { data: paidInvoices },
    { data: upcomingDeadlines },
    { data: recentInteractions },
  ] = await Promise.all([
    supabase
      .from("Tbl_Tasks")
      .select("id, description, due_date, updated_at, created_at, client_id")
      .eq("is_deleted", false)
      .not("status", "in", '("completed","done")')
      .lt("due_date", today)
      .order("due_date")
      .limit(5),
    supabase
      .from("Tbl_Documents")
      .select("id, name, created_at, client_id, uploaded_by")
      .eq("is_deleted", false)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("Tbl_Invoices")
      .select("id, invoice_number, amount, client_id, updated_at")
      .eq("is_deleted", false)
      .eq("status", "paid")
      .gte("updated_at", sevenDaysAgo)
      .order("updated_at", { ascending: false })
      .limit(5),
    supabase
      .from("Tbl_Deadlines")
      .select("id, title, due_date, created_at, client_id")
      .eq("is_deleted", false)
      .not("status", "in", '("completed","done")')
      .gte("due_date", today)
      .lte("due_date", threeDaysLater)
      .order("due_date")
      .limit(5),
    supabase
      .from("Tbl_Interactions")
      .select("id, interaction_type, created_at, client_id")
      .eq("is_deleted", false)
      .gte("created_at", sevenDaysAgo)
      .order("created_at", { ascending: false })
      .limit(5),
  ]);

  const allClientIds = [
    ...(overdueTasks || []).map((r) => r.client_id),
    ...(recentDocs || []).map((r) => r.client_id),
    ...(paidInvoices || []).map((r) => r.client_id),
    ...(upcomingDeadlines || []).map((r) => r.client_id),
    ...(recentInteractions || []).map((r) => r.client_id),
  ].filter(Boolean);

  let clientMap = {};
  if (allClientIds.length) {
    const { data: clients } = await supabase
      .from("Tbl_Clients")
      .select("id, name")
      .in("id", [...new Set(allClientIds)]);
    clientMap = Object.fromEntries((clients || []).map((c) => [c.id, c.name]));
  }

  const notifications = [];

  for (const task of overdueTasks || []) {
    const daysOverdue = Math.floor((Date.now() - new Date(task.due_date)) / 86400000);
    const clientName = clientMap[task.client_id] || "Unknown Client";
    notifications.push({
      id: `task_${task.id}`, type: "overdue_task", title: "Task Overdue",
      desc: `${task.description} for ${clientName} is overdue by ${daysOverdue} day${daysOverdue !== 1 ? "s" : ""}.`,
      icon: "Clock", color: "text-red", createdAt: task.updated_at || task.created_at,
    });
  }

  for (const doc of recentDocs || []) {
    const clientName = clientMap[doc.client_id] || "a client";
    notifications.push({
      id: `doc_${doc.id}`, type: "new_document", title: "New Document",
      desc: `${doc.name} uploaded for ${clientName}.`,
      icon: "FileText", color: "text-blue", createdAt: doc.created_at,
    });
  }

  for (const inv of paidInvoices || []) {
    const clientName = clientMap[inv.client_id] || "A client";
    const amount = new Intl.NumberFormat("en-IN").format(inv.amount);
    notifications.push({
      id: `inv_${inv.id}`, type: "invoice_paid", title: "Invoice Paid",
      desc: `${clientName} paid ${inv.invoice_number} (₹${amount}).`,
      icon: "CheckSquare", color: "text-green", createdAt: inv.updated_at,
    });
  }

  for (const deadline of upcomingDeadlines || []) {
    const clientName = clientMap[deadline.client_id];
    const daysLeft = Math.ceil((new Date(deadline.due_date) - Date.now()) / 86400000);
    const daysText = daysLeft === 0 ? "today" : `in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}`;
    notifications.push({
      id: `deadline_${deadline.id}`, type: "upcoming_deadline", title: "Deadline Approaching",
      desc: `${deadline.title}${clientName ? ` for ${clientName}` : ""} is due ${daysText}.`,
      icon: "Calendar", color: "text-amber", createdAt: deadline.created_at,
    });
  }

  for (const interaction of recentInteractions || []) {
    const clientName = clientMap[interaction.client_id] || "a client";
    notifications.push({
      id: `int_${interaction.id}`, type: "new_interaction", title: "Client Interaction",
      desc: `New ${interaction.interaction_type || "interaction"} logged for ${clientName}.`,
      icon: "MessageSquare", color: "text-amber", createdAt: interaction.created_at,
    });
  }

  notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  return notifications.slice(0, 20).map((n) => ({ ...n, time: timeAgo(n.createdAt) }));
}
