import { getStrings } from "@/src/lib/i18n/strings";
import type { ReportReason } from "@/src/services/postService";
import { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

const REPORT_DETAILS_MAX_LENGTH = 300;

const reportReasons: ReportReason[] = [
  "harassment",
  "hate",
  "violence",
  "sexual",
  "spam",
  "misinformation",
  "other",
];

type Props = {
  visible: boolean;
  submitting: boolean;
  onClose: () => void;
  onSubmit: (reason: ReportReason, details: string) => Promise<void>;
};

export default function ReportVoiceModal({
  visible,
  submitting,
  onClose,
  onSubmit,
}: Props) {
  const t = getStrings();
  const [selectedReason, setSelectedReason] = useState<ReportReason | null>(
    null,
  );
  const [details, setDetails] = useState("");
  const [message, setMessage] = useState("");

  function resetForm() {
    setSelectedReason(null);
    setDetails("");
    setMessage("");
  }

  function handleClose() {
    if (submitting) return;

    resetForm();
    onClose();
  }

  function getReasonLabel(reason: ReportReason) {
    switch (reason) {
      case "harassment":
        return t.report.reportReasonHarassment;
      case "hate":
        return t.report.reportReasonHate;
      case "violence":
        return t.report.reportReasonViolence;
      case "sexual":
        return t.report.reportReasonSexual;
      case "spam":
        return t.report.reportReasonSpam;
      case "misinformation":
        return t.report.reportReasonMisinformation;
      case "other":
        return t.report.reportReasonOther;
    }
  }

  async function handleSubmit() {
    if (!selectedReason || submitting) return;

    const trimmedDetails = details.trim();
    if (selectedReason === "other" && !trimmedDetails) {
      setMessage(t.report.reportDetailsRequired);
      return;
    }

    setMessage("");

    try {
      await onSubmit(selectedReason, trimmedDetails);
      resetForm();
      onClose();
    } catch {
      setMessage(t.report.reportError);
    }
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={handleClose}
    >
      <View className="flex-1 justify-end bg-black/70">
        <Pressable className="flex-1" onPress={handleClose} />
        <View className="rounded-t-3xl bg-neutral-950 border-t border-white/10 px-5 pt-5 pb-8">
          <Text className="text-white text-xl font-semibold">
            {t.report.reportVoiceTitle}
          </Text>

          <Text className="text-white/65 text-sm mt-4 mb-2">
            {t.report.reportReason}
          </Text>

          <View className="gap-2">
            {reportReasons.map((reason) => {
              const selected = selectedReason === reason;

              return (
                <Pressable
                  key={reason}
                  disabled={submitting}
                  onPress={() => {
                    setSelectedReason(reason);
                    setMessage("");
                  }}
                  className="rounded-xl border px-4 py-3"
                  style={{
                    backgroundColor: selected
                      ? "rgba(255,255,255,0.16)"
                      : "rgba(255,255,255,0.06)",
                    borderColor: selected
                      ? "rgba(255,255,255,0.45)"
                      : "rgba(255,255,255,0.12)",
                  }}
                >
                  <Text className="text-white">{getReasonLabel(reason)}</Text>
                </Pressable>
              );
            })}
          </View>

          <Text className="text-white/65 text-sm mt-4 mb-2">
            {t.report.reportDetails}
          </Text>
          <TextInput
            editable={!submitting}
            multiline
            maxLength={REPORT_DETAILS_MAX_LENGTH}
            value={details}
            onChangeText={setDetails}
            placeholder={t.report.reportDetailsPlaceholder}
            placeholderTextColor="rgba(255,255,255,0.38)"
            className="min-h-[72px] rounded-xl border border-white/12 bg-white/5 px-4 py-3 text-white"
            textAlignVertical="top"
          />

          {message ? (
            <Text className="text-white/75 text-sm mt-3">{message}</Text>
          ) : null}

          <View className="flex-row gap-3 mt-5">
            <Pressable
              disabled={submitting}
              onPress={handleClose}
              className="flex-1 rounded-full border border-white/15 py-3 items-center"
              style={{ opacity: submitting ? 0.55 : 1 }}
            >
              <Text className="text-white font-semibold">
                {t.actions.cancel}
              </Text>
            </Pressable>
            <Pressable
              disabled={!selectedReason || submitting}
              onPress={() => {
                void handleSubmit();
              }}
              className="flex-1 rounded-full py-3 items-center"
              style={{
                opacity: !selectedReason || submitting ? 0.55 : 1,
                backgroundColor: "#FFFFFF",
              }}
            >
              {submitting ? (
                <ActivityIndicator color="#000000" size="small" />
              ) : (
                <Text className="text-black font-semibold">
                  {t.report.submitReport}
                </Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
