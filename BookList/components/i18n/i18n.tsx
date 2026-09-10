import { Picker } from "@react-native-picker/picker";
import { StyleSheet, View } from "react-native";

import { Locale, useI18n } from "../../features/i18n/I18nProvider";
import ThemedPicker from "../ui/ThemedPicker";

export default function I18nSelector() {
  const { locale, setLocale, t } = useI18n();

  return (
    <View style={styles.container}>
      <ThemedPicker
        accessibilityLabel={t("language.label")}
        selectedValue={locale}
        style={styles.picker}
        onValueChange={(value) => setLocale(value as Locale)}
      >
        <Picker.Item label={t("language.fr")} value="fr" />
        <Picker.Item label={t("language.en")} value="en" />
      </ThemedPicker>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: "center",
    padding: 16,
  },
  picker: {
    minHeight: 44,
    width: 180,
  },
});
