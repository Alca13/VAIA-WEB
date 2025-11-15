"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchJSON } from "../../../lib/api";

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

interface BrandingState {
  logo: BrandingAsset;
  banner: BrandingAsset;
}

type AssetType = "logo" | "banner";

const assetLabels: Record<AssetType, string> = {
  logo: "Logotipo",
  banner: "Banner principal",
};

export default function BrandingPage() {
  const [branding, setBranding] = useState<BrandingState | null>(null);
  const [pendingFile, setPendingFile] = useState<Record<AssetType, File | null>>({
    logo: null,
    banner: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const activeAssets = useMemo(() => {
    if (!branding) return null;
    return (Object.keys(branding) as AssetType[]).reduce(
      (acc, key) => {
        const asset = branding[key];
        const version = asset.versions.find((item) => item.version === asset.activeVersion);
        if (version) {
          acc[key] = version;
        }
        return acc;
      },
      {} as Record<AssetType, BrandingVersion>,
    );
  }, [branding]);

  useEffect(() => {
    fetchJSON<BrandingState>("/api/branding")
      .then(setBranding)
      .catch(() => setError("No fue posible cargar el branding"));
  }, []);

  const handleFileChange = (assetType: AssetType, file: File | null) => {
    setPendingFile((prev) => ({ ...prev, [assetType]: file }));
  };

  const handleSubmit = async (assetType: AssetType) => {
    const file = pendingFile[assetType];
    if (!file) {
      setError("Selecciona un archivo antes de actualizar");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setFeedback(null);

    try {
      const formData = new FormData();
      formData.append("assetType", assetType);
      formData.append("file", file);
      const updated = await fetchJSON<BrandingState>("/api/branding", {
        method: "POST",
        body: formData,
      });
      setBranding(updated);
      setPendingFile((prev) => ({ ...prev, [assetType]: null }));
      setFeedback(`${assetLabels[assetType]} actualizado correctamente.`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No fue posible actualizar");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="grid" style={{ gap: "2rem" }}>
      <header>
        <h1 className="sectionTitle">Identidad visual</h1>
        <p className="sectionDescription">
          Gestiona los recursos gráficos corporativos con control de versiones y despliegue inmediato en el canal digital.
        </p>
      </header>

      {error && (
        <div
          className="tableCard"
          style={{ background: "#fef2f2", borderColor: "rgba(248, 113, 113, 0.4)", color: "#991b1b" }}
        >
          {error}
        </div>
      )}

      {feedback && (
        <div
          className="tableCard"
          style={{ background: "#ecfdf5", borderColor: "rgba(34, 197, 94, 0.3)", color: "#166534" }}
        >
          {feedback}
        </div>
      )}

      <section className="grid two">
        {(branding ? (Object.keys(branding) as AssetType[]) : []).map((assetType) => {
          const asset = branding![assetType];
          const activeVersion = activeAssets?.[assetType];
          return (
            <article key={assetType} className="tableCard" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
              <header>
                <h2 style={{ fontSize: "1.25rem", fontWeight: 600 }}>{assetLabels[assetType]}</h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                  Versión activa: {asset.activeVersion}
                </p>
              </header>

              {activeVersion && (
                <div
                  style={{
                    background: "#f1f5f9",
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: assetType === "logo" ? "120px" : "180px",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={activeVersion.path}
                    alt={`${assetLabels[assetType]} activo`}
                    style={{ maxWidth: "100%", maxHeight: "180px", objectFit: "contain" }}
                  />
                </div>
              )}

              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <label
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "0.35rem",
                    fontWeight: 500,
                  }}
                >
                  Actualizar recurso
                  <input
                    type="file"
                    accept={assetType === "logo" ? "image/*" : "image/*"}
                    onChange={(event) => handleFileChange(assetType, event.target.files?.[0] ?? null)}
                  />
                </label>
                <button
                  className="actionButton"
                  disabled={isSubmitting}
                  onClick={() => handleSubmit(assetType)}
                  style={{ justifyContent: "center", opacity: isSubmitting ? 0.75 : 1 }}
                >
                  {isSubmitting ? "Guardando..." : "Publicar nueva versión"}
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                <h3 style={{ fontSize: "1rem", fontWeight: 600 }}>Historial de versiones</h3>
                <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                  {asset.versions
                    .slice()
                    .sort((a, b) => b.version - a.version)
                    .map((version) => (
                      <li
                        key={version.version}
                        style={{
                          padding: "0.75rem 1rem",
                          borderRadius: "0.75rem",
                          background: version.version === asset.activeVersion ? "#e0f2fe" : "#f8fafc",
                          border: "1px solid rgba(148, 163, 184, 0.2)",
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "1rem",
                          alignItems: "center",
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600 }}>Versión {version.version}</div>
                          <div style={{ fontSize: "0.8rem", color: "#475569" }}>{version.fileName}</div>
                        </div>
                        <span style={{ fontSize: "0.8rem", color: "#64748b" }}>
                          {new Date(version.uploadedAt).toLocaleString("es-ES")}
                        </span>
                      </li>
                    ))}
                </ul>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
