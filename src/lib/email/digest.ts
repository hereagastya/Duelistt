import "server-only";

export type DigestRow = {
  user_id: string;
  email: string;
  timezone: string;
  prospect_name: string;
  next_follow_up_date: string;
  days_overdue: number;
  last_note: string | null;
};

export type Digest = {
  userId: string;
  email: string;
  items: DigestRow[];
};

/** One digest per user, preserving the query's oldest-first ordering. */
export function groupByUser(rows: DigestRow[]): Digest[] {
  const byUser = new Map<string, Digest>();

  for (const row of rows) {
    const existing = byUser.get(row.user_id);
    if (existing) existing.items.push(row);
    else byUser.set(row.user_id, { userId: row.user_id, email: row.email, items: [row] });
  }

  return [...byUser.values()];
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function lateLabel(days: number): string {
  if (days <= 0) return "due today";
  if (days === 1) return "1 day late";
  return `${days} days late`;
}

export function digestSubject(items: DigestRow[]): string {
  const n = items.length;
  // The subject line is the whole product for someone reading on a phone at
  // 7am. Lead with the number, not with the app's name.
  return n === 1 ? "1 follow-up due today" : `${n} follow-ups due today`;
}

export function digestText(items: DigestRow[], todayUrl: string): string {
  const lines = items.map((i) => {
    const note = i.last_note ? ` - ${i.last_note}` : "";
    return `- ${i.prospect_name} (${lateLabel(i.days_overdue)})${note}`;
  });

  return [digestSubject(items), "", ...lines, "", `Open your list: ${todayUrl}`].join("\n");
}

export function digestHtml(items: DigestRow[], todayUrl: string): string {
  // Inline styles and a table: email clients strip <style> blocks and do not
  // implement flex or grid reliably.
  const rows = items
    .map((i) => {
      const note = i.last_note
        ? `<div style="color:#6b625a;font-size:14px;margin-top:2px">${escapeHtml(i.last_note)}</div>`
        : "";
      const late = i.days_overdue >= 7 ? "#b4451f" : "#6b625a";

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #e3ded7">
            <div style="font-size:15px;font-weight:600;color:#2e2721">${escapeHtml(i.prospect_name)}</div>
            ${note}
          </td>
          <td style="padding:12px 0;border-bottom:1px solid #e3ded7;text-align:right;white-space:nowrap;vertical-align:top">
            <span style="font-size:13px;color:${late}">${lateLabel(i.days_overdue)}</span>
          </td>
        </tr>`;
    })
    .join("");

  return `<!doctype html>
<html lang="en">
<body style="margin:0;padding:24px;background:#faf9f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#2e2721">
  <div style="max-width:520px;margin:0 auto">
    <h1 style="font-size:18px;font-weight:600;margin:0 0 4px">${escapeHtml(digestSubject(items))}</h1>
    <p style="font-size:14px;color:#6b625a;margin:0 0 20px">Oldest first.</p>

    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="border-collapse:collapse;border-top:1px solid #e3ded7">
      ${rows}
    </table>

    <p style="margin:24px 0 0">
      <a href="${escapeHtml(todayUrl)}" style="display:inline-block;background:#a8451c;color:#faf9f7;text-decoration:none;font-size:14px;font-weight:500;padding:9px 14px;border-radius:3px">Open your list</a>
    </p>

    <p style="font-size:12px;color:#9a8f85;margin:28px 0 0">
      You are getting this because the daily digest is on. Turn it off in Settings.
    </p>
  </div>
</body>
</html>`;
}
