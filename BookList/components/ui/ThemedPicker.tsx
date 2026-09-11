import { Picker, PickerProps } from "@react-native-picker/picker";
import { Children, cloneElement, isValidElement } from "react";

import { useTheme } from "../../features/theme/ThemeProvider";

export default function ThemedPicker<T>({
  style,
  children,
  ...rest
}: PickerProps<T>) {
  const { colors } = useTheme();

  const items = Children.map(children, (child) =>
    isValidElement<{ color?: string }>(child)
      ? cloneElement(child, { color: child.props.color ?? colors.text })
      : child,
  );

  return (
    <Picker
      dropdownIconColor={colors.text}
      style={[
        {
          backgroundColor: colors.background,
          borderColor: colors.textMuted + "44",
          borderRadius: 6,
          borderWidth: 1,
          color: colors.text,
          paddingHorizontal: 8,
        },
        style,
      ]}
      {...rest}
    >
      {items}
    </Picker>
  );
}
