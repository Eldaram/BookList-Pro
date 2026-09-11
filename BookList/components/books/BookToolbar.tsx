import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { BookListFilters } from "../../features/books/BooksProvider";
import { useDebouncedValue } from "../../hooks/useDebouncedValue";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import { spacing, typography } from "../../theme/tokens";

type Props = {
  filters: BookListFilters;
  onChange: (patch: Partial<BookListFilters>) => void;
};

function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const { colors } = useTheme();
  return (
    <TouchableOpacity
      style={[
        styles.chip,
        { borderColor: active ? colors.primary : colors.coverPlaceholder },
        active && { backgroundColor: colors.primary },
      ]}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: active }}
    >
      <Text
        style={{
          color: active ? colors.textOnPrimary : colors.textMuted,
          fontSize: typography.body,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const SORTS = ["titre", "auteur", "annee", "note"] as const;

export default function BookToolbar({ filters, onChange }: Props) {
  const { colors } = useTheme();
  const { t } = useI18n();
  const [query, setQuery] = useState(filters.q ?? "");
  const debouncedQuery = useDebouncedValue(query);

  useEffect(() => {
    const next = debouncedQuery.trim();
    if (next === (filters.q ?? "")) return;
    onChange({ q: next || undefined });
  }, [debouncedQuery, filters.q, onChange]);

  const toggleStatus = (status: "lu" | "nonlu") =>
    onChange({ status: filters.status === status ? undefined : status });

  const cycleSort = () => {
    const index = SORTS.indexOf(filters.sort as (typeof SORTS)[number]);
    onChange({ sort: SORTS[(index + 1) % SORTS.length] });
  };

  return (
    <View style={styles.toolbar}>
      <TextInput
        style={[
          styles.search,
          { borderColor: colors.coverPlaceholder, color: colors.text },
        ]}
        placeholder={t("books.search.placeholder")}
        placeholderTextColor={colors.textMuted}
        value={query}
        onChangeText={setQuery}
        accessibilityLabel={t("books.search.placeholder")}
        accessibilityRole="search"
      />
      <View style={styles.row}>
        <Chip
          label={t("books.filters.read")}
          active={filters.status === "lu"}
          onPress={() => toggleStatus("lu")}
        />
        <Chip
          label={t("books.filters.unread")}
          active={filters.status === "nonlu"}
          onPress={() => toggleStatus("nonlu")}
        />
        <Chip
          label={t("books.filters.favorites")}
          active={filters.favori === true}
          onPress={() =>
            onChange({ favori: filters.favori === true ? undefined : true })
          }
        />
        <Chip
          label={`${t("books.sort.label")} : ${t(
            `books.sort.${filters.sort ?? "titre"}`,
          )}`}
          active={filters.sort !== undefined}
          onPress={cycleSort}
        />
        <TouchableOpacity
          style={styles.orderButton}
          onPress={() =>
            onChange({ order: filters.order === "desc" ? "asc" : "desc" })
          }
          accessibilityRole="button"
          accessibilityLabel={
            filters.order === "desc"
              ? t("books.sort.orderDesc")
              : t("books.sort.orderAsc")
          }
        >
          <MaterialIcons
            name={filters.order === "desc" ? "arrow-downward" : "arrow-upward"}
            size={20}
            color={colors.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  chip: {
    borderRadius: 22,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 44,
    paddingHorizontal: spacing.md * 2,
  },
  orderButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  row: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  search: {
    borderRadius: 8,
    borderWidth: 1,
    fontSize: typography.body,
    minHeight: 44,
    paddingHorizontal: spacing.md * 2,
  },
  toolbar: {
    gap: spacing.md,
    marginBottom: spacing.md,
  },
});
