import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, font, space, touchTarget } from '@/lib/theme';

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  const body = <View style={styles.content}>{children}</View>;
  return (
    <SafeAreaView style={styles.screen} edges={['bottom']}>
      {scroll ? <ScrollView contentContainerStyle={{ paddingBottom: space.lg }}>{body}</ScrollView> : body}
    </SafeAreaView>
  );
}

export function Title({ children }: { children: ReactNode }) {
  return (
    <Text style={styles.title} accessibilityRole="header">
      {children}
    </Text>
  );
}

export function Body({ children, muted }: { children: ReactNode; muted?: boolean }) {
  return <Text style={[styles.body, muted && { color: colors.muted }]}>{children}</Text>;
}

export function Card({ children }: { children: ReactNode }) {
  return <View style={styles.card}>{children}</View>;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  disabled,
  loading,
  hint,
}: {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
}) {
  const background = variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : colors.surface;
  const textColor = variant === 'secondary' ? colors.primary : colors.primaryText;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityHint={hint}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: background, opacity: disabled ? 0.5 : pressed ? 0.8 : 1 },
        variant === 'secondary' && { borderWidth: 2, borderColor: colors.primary },
      ]}
    >
      {loading ? <ActivityIndicator color={textColor} /> : <Text style={[styles.buttonText, { color: textColor }]}>{label}</Text>}
    </Pressable>
  );
}

export function Banner({ children }: { children: ReactNode }) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={[styles.body, { color: colors.warning }]}>{children}</Text>
    </View>
  );
}

export function Loading({ label = 'Carregando…' }: { label?: string }) {
  return (
    <View style={{ padding: space.lg, alignItems: 'center', gap: space.sm }}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Body muted>{label}</Body>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  content: { padding: space.md, gap: space.md },
  title: { fontSize: font.title, fontWeight: '700', color: colors.text },
  body: { fontSize: font.body, lineHeight: font.body * 1.4, color: colors.text },
  card: { backgroundColor: colors.surface, borderRadius: 12, padding: space.md, gap: space.sm, borderWidth: 1, borderColor: colors.border },
  button: { minHeight: touchTarget, borderRadius: 12, alignItems: 'center', justifyContent: 'center', paddingHorizontal: space.md },
  buttonText: { fontSize: font.body, fontWeight: '700' },
  banner: { backgroundColor: colors.warningBg, borderRadius: 12, padding: space.md },
});
