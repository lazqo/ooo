import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import * as Haptics from 'expo-haptics';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { generateApology, generateReconnectMessage } from '@/lib/openai';
import { generateMessages } from '@/lib/openai';
import { ApologyReason } from '@/lib/types';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, spacing, typography, radius } from '@/constants/theme';

const APOLOGY_REASONS: Array<{ value: ApologyReason; label: string; desc: string }> = [
  { value: 'forgot_something', label: 'I forgot something', desc: 'Missed an event, date, or task' },
  { value: 'too_busy', label: "I've been too busy", desc: 'Neglected her due to work or stress' },
  { value: 'upset_her', label: 'I upset her', desc: 'Argument or said something hurtful' },
  { value: 'replied_badly', label: 'I replied badly', desc: 'Snapped or responded harshly' },
  { value: 'calm_situation', label: 'Calm the situation', desc: 'Reduce tension without full apology' },
  { value: 'take_responsibility', label: 'Full responsibility', desc: 'Own it completely' },
];

export default function EmergencyScreen() {
  const router = useRouter();
  const { mode } = useLocalSearchParams<{ mode?: string }>();
  const { profile } = usePartnerProfile();
  const [activeMode, setActiveMode] = useState(mode ?? 'apology');
  const [selectedReason, setSelectedReason] = useState<ApologyReason>('forgot_something');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async () => {
    if (!profile) {
      Alert.alert('No profile', 'Set up a partner profile first.');
      return;
    }
    setLoading(true);
    setResult('');
    try {
      let text = '';
      if (activeMode === 'apology') {
        text = await generateApology(profile, selectedReason);
      } else if (activeMode === 'reconnect') {
        text = await generateReconnectMessage(profile);
      } else if (activeMode === 'celebration') {
        const msgs = await generateMessages(profile, 'celebration');
        text = msgs.romantic;
      }
      setResult(text);
    } catch {
      Alert.alert('Error', 'Could not generate. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await Clipboard.setStringAsync(result);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="chevron-down" size={24} color={colors.textSecondary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Emergency Mode</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Mode selector */}
        <View style={styles.modeRow}>
          {[
            { value: 'apology', label: 'Apology', icon: 'bandage-outline' as const, color: colors.accent },
            { value: 'reconnect', label: 'Reconnect', icon: 'refresh-outline' as const, color: '#7B8FE8' },
            { value: 'celebration', label: 'Celebrate', icon: 'trophy-outline' as const, color: colors.success },
          ].map(m => (
            <TouchableOpacity
              key={m.value}
              style={[styles.modeChip, activeMode === m.value && { borderColor: m.color, backgroundColor: m.color + '22' }]}
              onPress={() => { setActiveMode(m.value); setResult(''); }}
              activeOpacity={0.7}
            >
              <Ionicons name={m.icon} size={16} color={activeMode === m.value ? m.color : colors.textSecondary} />
              <Text style={[styles.modeLabel, activeMode === m.value && { color: m.color }]}>{m.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Apology reasons */}
        {activeMode === 'apology' && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>What happened?</Text>
            {APOLOGY_REASONS.map(r => (
              <TouchableOpacity
                key={r.value}
                style={[styles.reasonCard, selectedReason === r.value && styles.reasonCardActive]}
                onPress={() => setSelectedReason(r.value)}
                activeOpacity={0.75}
              >
                <View style={styles.reasonRadio}>
                  {selectedReason === r.value && <View style={styles.reasonRadioInner} />}
                </View>
                <View style={styles.reasonInfo}>
                  <Text style={styles.reasonLabel}>{r.label}</Text>
                  <Text style={styles.reasonDesc}>{r.desc}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {activeMode === 'reconnect' && (
          <Card style={styles.modeInfo}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.modeInfoText}>
              For when things feel cold or distant. A genuine message to open things back up.
            </Text>
          </Card>
        )}

        {activeMode === 'celebration' && (
          <Card style={styles.modeInfo}>
            <Ionicons name="information-circle-outline" size={16} color={colors.textSecondary} />
            <Text style={styles.modeInfoText}>
              Good news, a promotion, an achievement — something worth celebrating together.
            </Text>
          </Card>
        )}

        <Button
          label={loading ? 'Writing...' : 'Generate'}
          onPress={handleGenerate}
          loading={loading}
          disabled={!profile}
          fullWidth
        />

        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
          </View>
        )}

        {result && !loading && (
          <Card style={styles.resultCard} elevated>
            <Text style={styles.resultText}>{result}</Text>
            <TouchableOpacity style={styles.copyBtn} onPress={handleCopy} activeOpacity={0.7}>
              <Ionicons
                name={copied ? 'checkmark' : 'copy-outline'}
                size={18}
                color={copied ? colors.success : colors.primary}
              />
              <Text style={[styles.copyText, copied && { color: colors.success }]}>
                {copied ? 'Copied' : 'Copy message'}
              </Text>
            </TouchableOpacity>
          </Card>
        )}

        <View style={styles.reminder}>
          <Ionicons name="lock-closed-outline" size={12} color={colors.textMuted} />
          <Text style={styles.reminderText}>Review before sending. You stay in full control.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.text },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  modeRow: { flexDirection: 'row', gap: spacing.sm },
  modeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  modeLabel: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '600' },
  section: { gap: spacing.sm },
  sectionLabel: { ...typography.label, color: colors.textSecondary },
  reasonCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  reasonCardActive: { borderColor: colors.accent, backgroundColor: colors.accent + '11' },
  reasonRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reasonRadioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.accent,
  },
  reasonInfo: { flex: 1 },
  reasonLabel: { ...typography.body, color: colors.text, fontWeight: '500' },
  reasonDesc: { ...typography.bodySmall, color: colors.textSecondary },
  modeInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  modeInfoText: { ...typography.body, color: colors.textSecondary, flex: 1 },
  loadingWrap: { alignItems: 'center' },
  resultCard: { gap: spacing.md },
  resultText: { ...typography.body, color: colors.text, lineHeight: 26 },
  copyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  copyText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  reminder: {
    flexDirection: 'row',
    gap: spacing.xs,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderText: { ...typography.caption, color: colors.textMuted },
});
