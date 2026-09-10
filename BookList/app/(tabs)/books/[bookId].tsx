import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BookDetails from "../../../components/books/BookDetails";
import BookListLoading from "../../../components/books/BookListLoading";
import { useBook } from "../../../hooks/useBook";

export default function BookDetailsPage() {
  const { bookId } = useLocalSearchParams<{ bookId: string }>();
  const { book, loading, error } = useBook(bookId);

  if (loading) return <BookListLoading />;
  if (error || !book) {
    return (
      <View>
        <Text>{error?.message ?? "Livre introuvable."}</Text>
      </View>
    );
  }
  return <BookDetails key={book.id} book={book} />;
}
