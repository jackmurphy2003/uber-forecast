import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "text-edits.json");

export async function POST(req: Request) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "disabled outside dev" }, { status: 403 });
  }
  const body = await req.json();
  const existing = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, "utf-8")) : [];
  const merged = [...existing, ...body.edits];
  fs.writeFileSync(FILE, JSON.stringify(merged, null, 2));
  return NextResponse.json({ ok: true, count: merged.length });
}
