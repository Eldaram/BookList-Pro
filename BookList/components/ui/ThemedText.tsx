import { Text, TextProps } from "react-native";

import { useTheme } from "../../features/theme/ThemeProvider";

type ThemedTextProps = TextProps & { muted?: boolean };

export default function ThemedText({ muted, style, ...rest }: ThemedTextProps) {
  const { colors } = useTheme();

  return (
    <Text
      style={[{ color: muted ? colors.textMuted : colors.text }, style]}
      {...rest}
    />
  );
}
