import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import BookForm, { BookFormMode } from "../../../components/books/BookForm";
import BookListLoading from "../../../components/books/BookListLoading";
import { useBook } from "../../../hooks/useBook";

export default function BookFormPage() {
  const { mode, bookId } = useLocalSearchParams<{
    mode: BookFormMode;
    bookId?: string;
  }>();
  const isUpdate = mode === "UPDATE";
  const { book, loading, error } = useBook(isUpdate ? bookId : undefined);

  if (!isUpdate) return <BookForm key="create" mode="CREATE" />;
  if (loading) return <BookListLoading />;
  if (error || !book) {
    return (
      <View>
        <Text>{error?.message ?? "Livre introuvable."}</Text>
      </View>
    );
  }
  return <BookForm key={book.id} mode="UPDATE" book={book} />;
}
