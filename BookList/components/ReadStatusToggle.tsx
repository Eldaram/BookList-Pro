import React from "react";
import {
  GestureResponderEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useTheme } from "../features/theme/ThemeProvider";
import { useI18n } from "../features/i18n/I18nProvider";
import { spacing, typography } from "../theme/tokens";

export default function ReadStatusToggle({
  lu,
  onPress,
}: {
  lu: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const label = lu ? t("books.read.markUnread") : t("books.read.markRead");

  const handlePress = (event: GestureResponderEvent) => {
    event.stopPropagation();
    onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { borderColor: lu ? colors.primary : colors.textMuted },
      ]}
      onPress={handlePress}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ checked: lu }}
    >
      <MaterialIcons
        name={lu ? "check-circle" : "radio-button-unchecked"}
        size={20}
        color={lu ? colors.primary : colors.textMuted}
      />
      <Text
        style={[
          styles.label,
          { color: lu ? colors.primary : colors.textMuted },
        ]}
      >
        {lu ? t("books.read.read") : t("books.read.notRead")}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderRadius: 22,
    borderWidth: 1,
    flexDirection: "row",
    gap: spacing.md,
    minHeight: 44,
    paddingHorizontal: spacing.md,
  },
  label: {
    fontSize: typography.body,
    fontWeight: "600",
  },
});
