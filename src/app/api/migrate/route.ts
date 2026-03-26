import { NextRequest, NextResponse } from "next/server";
import { migrate } from "@/lib/migrate";

export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.ADMIN_PASSWORD}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await migrate();
    return NextResponse.json({ success: true, message: "Migration completed" });
  } catch (error) {
    return NextResponse.json(
      { error: "Migration failed", details: String(error) },
      { status: 500 }
    );
  }
}
