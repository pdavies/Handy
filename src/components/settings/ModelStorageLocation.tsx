import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { open } from "@tauri-apps/plugin-dialog";
import { commands } from "@/bindings";
import { notify } from "@/stores/noticeStore";
import { SettingContainer } from "../ui/SettingContainer";
import { Button } from "../ui/Button";

interface ModelStorageLocationProps {
  descriptionMode?: "tooltip" | "inline";
  grouped?: boolean;
}

export const ModelStorageLocation: React.FC<ModelStorageLocationProps> = ({
  descriptionMode = "inline",
  grouped = false,
}) => {
  const { t } = useTranslation();
  const [storageDir, setStorageDir] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    commands
      .getModelStorageDir()
      .then(setStorageDir)
      .catch((err) => console.error("Failed to load model folder:", err));
  }, []);

  const apply = async (path: string | null) => {
    setBusy(true);
    try {
      const result = await commands.setModelStorageDir(path);
      if (result.status === "ok") {
        setStorageDir(path);
      } else {
        notify({
          title: t("settings.advanced.modelStorage.changeFailed"),
          detail: result.error,
        });
      }
    } finally {
      setBusy(false);
    }
  };

  const handleChange = async () => {
    const picked = await open({
      directory: true,
      multiple: false,
      defaultPath: storageDir ?? undefined,
      title: t("settings.advanced.modelStorage.choose"),
    });
    if (typeof picked === "string") {
      await apply(picked);
    }
  };

  return (
    <SettingContainer
      title={t("settings.advanced.modelStorage.title")}
      description={t("settings.advanced.modelStorage.description")}
      descriptionMode={descriptionMode}
      grouped={grouped}
      layout="stacked"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 min-w-0 px-2 py-2 bg-wash border border-line-strong rounded-lg text-xs font-mono break-all select-text cursor-text">
          {storageDir ?? t("settings.advanced.modelStorage.default")}
        </div>
        <Button
          onClick={handleChange}
          variant="secondary"
          size="sm"
          disabled={busy}
          className="px-3 py-2"
        >
          {t("settings.advanced.modelStorage.change")}
        </Button>
        {storageDir && (
          <Button
            onClick={() => apply(null)}
            variant="ghost"
            size="sm"
            disabled={busy}
            className="px-3 py-2"
          >
            {t("settings.advanced.modelStorage.reset")}
          </Button>
        )}
      </div>
    </SettingContainer>
  );
};
