import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const DATA_PATH = path.join(process.cwd(), "data", "reports.json");

export async function GET() {
  try {
    const buffer = await readFile(DATA_PATH, "utf-8");
    const reports = JSON.parse(buffer);
    return NextResponse.json(reports);
  } catch (error) {
    return NextResponse.json({ message: "No fue posible obtener los reportes" }, { status: 500 });
  }
}
