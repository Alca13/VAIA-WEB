import { NextResponse } from "next/server";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";

interface BrandingVersion {
  version: number;
  fileName: string;
  uploadedAt: string;
  path: string;
}

interface BrandingAsset {
  activeVersion: number;
  versions: BrandingVersion[];
}

interface BrandingPayload {
  logo: BrandingAsset;
  banner: BrandingAsset;
}

const DATA_PATH = path.join(process.cwd(), "data", "branding.json");

async function readBranding(): Promise<BrandingPayload> {
  const buffer = await readFile(DATA_PATH, "utf-8");
  return JSON.parse(buffer) as BrandingPayload;
}

async function writeBranding(payload: BrandingPayload) {
  await writeFile(DATA_PATH, JSON.stringify(payload, null, 2));
}

export async function GET() {
  try {
    const branding = await readBranding();
    return NextResponse.json(branding);
  } catch (error) {
    return NextResponse.json(
      { message: "No fue posible leer la configuración de branding" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const assetType = formData.get("assetType");
    const file = formData.get("file");

    if (assetType !== "logo" && assetType !== "banner") {
      return NextResponse.json({ message: "Tipo de recurso no soportado" }, { status: 400 });
    }

    if (!(file instanceof File)) {
      return NextResponse.json({ message: "Archivo inválido" }, { status: 400 });
    }

    const branding = await readBranding();
    const asset = branding[assetType];
    const nextVersion = (asset.versions.at(-1)?.version ?? 0) + 1;

    const uploadsDir = path.join(process.cwd(), "public", "uploads", assetType);
    await mkdir(uploadsDir, { recursive: true });

    const sanitized = file.name.replace(/[^a-zA-Z0-9.\-]/g, "-");
    const storedFileName = `${Date.now()}-${sanitized}`;
    const filePath = path.join(uploadsDir, storedFileName);
    const arrayBuffer = await file.arrayBuffer();
    await writeFile(filePath, Buffer.from(arrayBuffer));

    const publicPath = `/uploads/${assetType}/${storedFileName}`;
    const version: BrandingVersion = {
      version: nextVersion,
      fileName: file.name,
      uploadedAt: new Date().toISOString(),
      path: publicPath,
    };

    asset.versions.push(version);
    asset.activeVersion = nextVersion;

    await writeBranding(branding);

    return NextResponse.json(branding);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "No fue posible actualizar el branding" },
      { status: 500 },
    );
  }
}
