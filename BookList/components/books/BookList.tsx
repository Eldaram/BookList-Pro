import React, { useCallback, useEffect, useRef } from "react";
import {
  ActivityIndicator,
  FlatList,
  NativeSyntheticEvent,
  NativeScrollEvent,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { spacing, typography } from "../../theme/tokens";
import { useBooks } from "../../hooks/useBooks";
import { useI18n } from "../../features/i18n/I18nProvider";
import { useTheme } from "../../features/theme/ThemeProvider";
import { CELL_TARGET_WIDTH } from "./BookCardShell";
import BookCell from "./BookCell";
import BookListLoading from "./BookListLoading";
import AddButton from "../AddButton";

export default function BookList() {
  const router = useRouter();
  const { t } = useI18n();
  const { colors } = useTheme();
  const {
    books,
    loading,
    loadingMore,
    refreshing,
    error,
    toggleFavorite,
    hasMore,
    total,
    fetchNextPage,
    refresh,
    scrollOffset,
    setScrollOffset,
  } = useBooks();

  const { width } = useWindowDimensions();
  const flatListRef = useRef<FlatList>(null);
  const isRestoredRef = useRef(false);
  const isRestoringScrollRef = useRef(false);

  const numColumns = Math.max(
    2,
    Math.floor(width / (CELL_TARGET_WIDTH + spacing.md * 2)),
  );

  const openBook = useCallback(
    (id: string) => router.push(`/books/${id}`),
    [router],
  );

  useEffect(() => {
    if (
      !isRestoredRef.current &&
      scrollOffset > 0 &&
      flatListRef.current &&
      books.length > 0
    ) {
      isRestoredRef.current = true;
      isRestoringScrollRef.current = true;

      const timer = setTimeout(() => {
        try {
          flatListRef.current?.scrollToOffset({
            offset: scrollOffset,
            animated: false,
          });
        } catch {
          // ignore layout timing exceptions
        } finally {
          setTimeout(() => {
            isRestoringScrollRef.current = false;
          }, 150);
        }
      }, 60);

      return () => clearTimeout(timer);
    }
  }, [scrollOffset, books.length]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (isRestoringScrollRef.current) return;
    const yOffset = e.nativeEvent.contentOffset.y;

    if (yOffset >= 0) {
      setScrollOffset(yOffset);
    }
  };

  if (loading && books.length === 0) {
    return <BookListLoading />;
  }

  if (error && books.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.errorMessage, { color: colors.textMuted }]}>
          {error.message}
        </Text>
        <TouchableOpacity
          style={[styles.retryButton, { backgroundColor: colors.primary }]}
          onPress={refresh}
          accessibilityRole="button"
          accessibilityLabel={t("books.retry")}
        >
          <Text style={{ color: colors.textOnPrimary }}>
            {t("books.retry")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (books.length === 0) {
    return (
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.text }}>{t("books.empty")}</Text>
      </View>
    );
  }

  const renderFooter = () => {
    if (loadingMore) {
      return (
        <View style={styles.footerLoader}>
          <ActivityIndicator size="small" color={colors.text} />
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            {t("books.loadingMore")}
          </Text>
        </View>
      );
    }
    if (!hasMore && books.length > 0) {
      return (
        <View style={styles.footerLoader}>
          <Text style={[styles.footerText, { color: colors.textMuted }]}>
            {t("books.allLoaded")} ({books.length} / {total})
          </Text>
        </View>
      );
    }
    return <View style={styles.footerSpacer} />;
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.toolbar}>
        <AddButton onPress={() => router.push("/books/form?mode=CREATE")} />
      </View>
      <FlatList
        ref={flatListRef}
        key={numColumns}
        data={books}
        keyExtractor={(item) => item.id}
        numColumns={numColumns}
        style={styles.list}
        contentContainerStyle={styles.grid}
        onEndReached={fetchNextPage}
        onEndReachedThreshold={0.4}
        onScroll={handleScroll}
        scrollEventThrottle={32}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            colors={[colors.text]}
            tintColor={colors.text}
          />
        }
        ListFooterComponent={renderFooter}
        renderItem={({ item }) => (
          <BookCell
            book={item}
            numColumns={numColumns}
            onOpen={openBook}
            onToggleFavorite={toggleFavorite}
          />
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "stretch",
    flex: 1,
  },
  container: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: spacing.lg,
  },
  errorMessage: {
    fontSize: typography.body,
    textAlign: "center",
  },
  retryButton: {
    alignItems: "center",
    borderRadius: 8,
    justifyContent: "center",
    marginTop: spacing.lg,
    minHeight: 44,
    paddingHorizontal: spacing.lg,
  },
  grid: {
    padding: spacing.md,
  },
  toolbar: {
    alignItems: "flex-end",
    alignSelf: "stretch",
    marginBottom: spacing.md,
  },
  list: {
    alignSelf: "stretch",
    flex: 1,
  },
  footerLoader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
    paddingVertical: spacing.lg,
    gap: spacing.md,
  },
  footerText: {
    fontSize: typography.body,
  },
  footerSpacer: {
    height: spacing.lg,
  },
});
