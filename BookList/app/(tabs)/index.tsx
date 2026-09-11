import { StyleSheet, View } from "react-native";
import BookList from "../../components/books/BookList";
import BookToolbar from "../../components/books/BookToolbar";
import { useBooks } from "../../hooks/useBooks";
import { spacing } from "../../theme/tokens";

export default function BooksScreen() {
  const { filters, setFilters } = useBooks();

  return (
    <View style={styles.container}>
      <BookToolbar filters={filters} onChange={setFilters} />
      <BookList />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "stretch",
    flex: 1,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
});
