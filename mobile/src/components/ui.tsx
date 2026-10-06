import Ionicons from '@expo/vector-icons/Ionicons';
import { Image } from 'expo-image';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { colors, font, MAX_WIDTH, radius, space, TAP } from '@/theme';

export type IconName = ComponentProps<typeof Ionicons>['name'];

export function Screen({
  children,
  footer,
  scroll = true,
  edges = [],
}: {
  children: ReactNode;
  footer?: ReactNode;
  scroll?: boolean;
  edges?: ('top' | 'bottom')[];
}) {
  const body = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={styles.screen} edges={edges}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {body}
        </ScrollView>
      ) : (
        body
      )}
      {footer ? (
        <View style={styles.footer}>
          <View style={styles.footerInner}>{footer}</View>
        </View>
      ) : null}
    </SafeAreaView>
  );
}

type TextProps = { children: ReactNode; style?: StyleProp<TextStyle>; center?: boolean };

export function Title({ children, style, center }: TextProps) {
  return (
    <Text accessibilityRole="header" style={[styles.title, center && styles.center, style]}>
      {children}
    </Text>
  );
}

export function Heading({ children, style, center }: TextProps) {
  return (
    <Text accessibilityRole="header" style={[styles.heading, center && styles.center, style]}>
      {children}
    </Text>
  );
}

export function Body({ children, style, center }: TextProps) {
  return <Text style={[styles.body, center && styles.center, style]}>{children}</Text>;
}

export function Muted({ children, style, center }: TextProps) {
  return <Text style={[styles.muted, center && styles.center, style]}>{children}</Text>;
}

type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';

export function Button({
  label,
  onPress,
  icon,
  variant = 'primary',
  disabled,
  loading,
  style,
  accessibilityHint,
}: {
  label: string;
  onPress: () => void;
  icon?: IconName;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
  accessibilityHint?: string;
}) {
  const v = BUTTON_VARIANTS[variant];
  const inactive = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={accessibilityHint}
      accessibilityState={{ disabled: !!inactive, busy: !!loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: pressed ? v.pressed : v.bg, borderColor: v.border },
        inactive && styles.disabled,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={v.fg} size="large" />
      ) : (
        <>
          {icon ? <Ionicons name={icon} size={28} color={v.fg} /> : null}
          <Text style={[styles.buttonText, { color: v.fg }]}>{label}</Text>
        </>
      )}
    </Pressable>
  );
}

const BUTTON_VARIANTS: Record<ButtonVariant, { bg: string; pressed: string; fg: string; border: string }> = {
  primary: { bg: colors.primary, pressed: colors.primaryPressed, fg: colors.onPrimary, border: colors.primary },
  secondary: { bg: colors.surface, pressed: colors.surfaceMuted, fg: colors.primary, border: colors.primary },
  danger: { bg: colors.surface, pressed: colors.dangerSoft, fg: colors.danger, border: colors.danger },
  ghost: { bg: 'transparent', pressed: colors.surfaceMuted, fg: colors.primary, border: 'transparent' },
};

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

/** Large selectable row, used for single and multi choice. */
export function Choice({
  label,
  hint,
  selected,
  onPress,
  multi,
  disabled,
}: {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  multi?: boolean;
  disabled?: boolean;
}) {
  const icon: IconName = multi
    ? selected ? 'checkbox' : 'square-outline'
    : selected ? 'radio-button-on' : 'radio-button-off';
  return (
    <Pressable
      accessibilityRole={multi ? 'checkbox' : 'radio'}
      accessibilityState={{ checked: selected, disabled }}
      accessibilityLabel={hint ? `${label}, ${hint}` : label}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.choice,
        selected && styles.choiceSelected,
        pressed && { backgroundColor: colors.surfaceMuted },
        disabled && styles.disabled,
      ]}>
      <Ionicons name={icon} size={32} color={selected ? colors.primary : colors.textMuted} />
      <View style={{ flex: 1 }}>
        <Text style={[styles.choiceLabel, selected && { color: colors.primary }]}>{label}</Text>
        {hint ? <Text style={styles.muted}>{hint}</Text> : null}
      </View>
    </Pressable>
  );
}

export function Field({
  label,
  help,
  error,
  ...input
}: TextInputProps & { label: string; help?: string; error?: string | null }) {
  return (
    <View style={{ gap: space.xs }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      {help ? <Text style={styles.muted}>{help}</Text> : null}
      <TextInput
        accessibilityLabel={label}
        placeholderTextColor="#767676"
        {...input}
        style={[
          styles.input,
          input.multiline && { minHeight: 120, textAlignVertical: 'top' },
          error && { borderColor: colors.danger },
          input.style,
        ]}
      />
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

export function Notice({
  children,
  tone = 'info',
  icon,
}: {
  children: ReactNode;
  tone?: 'info' | 'warning' | 'danger' | 'success';
  icon?: IconName;
}) {
  const t = {
    info: { bg: colors.surfaceMuted, fg: colors.text, icon: 'information-circle' as IconName },
    warning: { bg: colors.warningSoft, fg: colors.warning, icon: 'alert-circle' as IconName },
    danger: { bg: colors.dangerSoft, fg: colors.danger, icon: 'close-circle' as IconName },
    success: { bg: colors.successSoft, fg: colors.success, icon: 'checkmark-circle' as IconName },
  }[tone];
  return (
    <View accessibilityRole="alert" style={[styles.notice, { backgroundColor: t.bg }]}>
      <Ionicons name={icon ?? t.icon} size={28} color={t.fg} />
      <Text style={[styles.body, { color: t.fg, flex: 1 }]}>{children}</Text>
    </View>
  );
}

export function Stars({ value, count, size = font.body }: { value: number; count?: number; size?: number }) {
  const label = count !== undefined ? `${value.toFixed(1)} puan, ${count} değerlendirme` : `${value} yıldız`;
  return (
    <View accessible accessibilityLabel={label} style={styles.row}>
      <Ionicons name="star" size={size + 4} color={colors.star} />
      <Text style={[styles.bodyStrong, { fontSize: size }]}>{value.toFixed(1).replace('.', ',')}</Text>
      {count !== undefined ? <Text style={[styles.muted, { fontSize: size - 2 }]}>({count} yorum)</Text> : null}
    </View>
  );
}

export function StarInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <View accessibilityRole="adjustable" style={[styles.row, { gap: space.sm, justifyContent: 'center' }]}>
      {[1, 2, 3, 4, 5].map((n) => (
        <Pressable
          key={n}
          accessibilityRole="button"
          accessibilityLabel={`${n} yıldız`}
          accessibilityState={{ selected: value >= n }}
          onPress={() => onChange(n)}
          hitSlop={6}
          style={{ padding: 4 }}>
          <Ionicons name={value >= n ? 'star' : 'star-outline'} size={52} color={colors.star} />
        </Pressable>
      ))}
    </View>
  );
}

export function Avatar({ uri, size = 96 }: { uri: string | null; size?: number }) {
  return uri ? (
    <Image
      source={{ uri }}
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors.surfaceMuted }}
      contentFit="cover"
      accessibilityIgnoresInvertColors
    />
  ) : (
    <View style={[styles.avatarEmpty, { width: size, height: size, borderRadius: size / 2 }]}>
      <Ionicons name="person" size={size / 2} color={colors.textMuted} />
    </View>
  );
}

export function Tag({ label, icon, tone = 'neutral' }: { label: string; icon?: IconName; tone?: 'neutral' | 'success' | 'warning' }) {
  const t = {
    neutral: { bg: colors.surfaceMuted, fg: colors.text },
    success: { bg: colors.successSoft, fg: colors.success },
    warning: { bg: colors.warningSoft, fg: colors.warning },
  }[tone];
  return (
    <View style={[styles.tag, { backgroundColor: t.bg }]}>
      {icon ? <Ionicons name={icon} size={20} color={t.fg} /> : null}
      <Text style={[styles.tagText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

export function Row({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[styles.row, style]}>{children}</View>;
}

export function InfoLine({ icon, children }: { icon: IconName; children: ReactNode }) {
  return (
    <View style={[styles.row, { alignItems: 'flex-start' }]}>
      <Ionicons name={icon} size={26} color={colors.primary} style={{ marginTop: 1 }} />
      <Text style={[styles.body, { flex: 1 }]}>{children}</Text>
    </View>
  );
}

export function Loading() {
  return (
    <View style={[styles.screen, { alignItems: 'center', justifyContent: 'center' }]}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.muted, { marginTop: space.md }]}>Yükleniyor…</Text>
    </View>
  );
}

export const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { flexGrow: 1, alignItems: 'center' },
  content: { width: '100%', maxWidth: MAX_WIDTH, padding: space.md, gap: space.md, paddingBottom: space.xl },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
  },
  footerInner: { width: '100%', maxWidth: MAX_WIDTH, padding: space.md, gap: space.sm },
  title: { fontSize: font.heading, lineHeight: font.heading * 1.25, fontWeight: '700', color: colors.text },
  heading: { fontSize: font.title, lineHeight: font.title * 1.3, fontWeight: '700', color: colors.text },
  body: { fontSize: font.body, lineHeight: font.body * 1.45, color: colors.text },
  bodyStrong: { fontSize: font.body, lineHeight: font.body * 1.45, color: colors.text, fontWeight: '700' },
  muted: { fontSize: font.small, lineHeight: font.small * 1.45, color: colors.textMuted },
  center: { textAlign: 'center' },
  button: {
    minHeight: TAP,
    borderRadius: radius.md,
    borderWidth: 2,
    paddingHorizontal: space.lg,
    paddingVertical: space.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: space.sm,
  },
  buttonText: { fontSize: font.large, fontWeight: '700' },
  disabled: { opacity: 0.45 },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.md,
    gap: space.sm,
  },
  choice: {
    minHeight: TAP + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    borderRadius: radius.md,
    borderWidth: 2,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  choiceSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  choiceLabel: { fontSize: font.large, fontWeight: '600', color: colors.text },
  fieldLabel: { fontSize: font.large, fontWeight: '700', color: colors.text },
  input: {
    minHeight: TAP,
    borderWidth: 2,
    borderColor: colors.border,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    paddingHorizontal: space.md,
    paddingVertical: space.sm,
    fontSize: font.large,
    color: colors.text,
  },
  error: { fontSize: font.body, color: colors.danger, fontWeight: '600' },
  notice: { flexDirection: 'row', gap: space.sm, padding: space.md, borderRadius: radius.md, alignItems: 'flex-start' },
  row: { flexDirection: 'row', alignItems: 'center', gap: space.xs, flexWrap: 'wrap' },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  tagText: { fontSize: font.small, fontWeight: '600' },
  avatarEmpty: { backgroundColor: colors.surfaceMuted, alignItems: 'center', justifyContent: 'center' },
});
