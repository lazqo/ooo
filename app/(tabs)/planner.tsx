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
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { generateDateIdeas } from '@/lib/openai';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, spacing, typography, radius } from '@/constants/theme';

const BUDGETS = ['Under $50', '$50–150', '$150–300', '$300+', 'Any'];
const TIMES = ['2 hours', 'Half day', 'Full day', 'Weekend'];

export default function PlannerScreen() {
  const router = useRouter();
  const { profile } = usePartnerProfile();
  const [budget, setBudget] = useState('$50–150');
  const [time, setTime] = useState('2 hours');
  const [isIndoor, setIsIndoor] = useState(false);
  const [withKids, setWithKids] = useState(false);
  const [loading, setLoading] = useState(false);
  const [ideas, setIdeas] = useState<string[]>([]);

  const handleGenerate = async () => {
    if (!profile) {
      Alert.alert('No Profile', 'Add a partner profile first.');
      return;
    }
    setLoading(true);
    setIdeas([]);
    try {
      const result = await generateDateIdeas(profile, budget, time, isIndoor, withKids);
      setIdeas(result);
    } catch {
      Alert.alert('Error', 'Could not generate ideas. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Planner</Text>
        <Text style={styles.subtitle}>Date night ideas and emergency tools</Text>

        {/* Date night planner */}
        <Card style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="restaurant-outline" size={18} color={colors.primary} />
            <Text style={styles.sectionTitle}>Date Night Generator</Text>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Budget</Text>
            <View style={styles.chips}>
              {BUDGETS.map(b => (
                <TouchableOpacity
                  key={b}
                  style={[styles.chip, budget === b && styles.chipActive]}
                  onPress={() => setBudget(b)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, budget === b && styles.chipTextActive]}>{b}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.fieldGroup}>
            <Text style={styles.fieldLabel}>Time available</Text>
            <View style={styles.chips}>
              {TIMES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, time === t && styles.chipActive]}
                  onPress={() => setTime(t)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.chipText, time === t && styles.chipTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.toggleRow}>
            <ToggleOption
              label="Indoor"
              icon="home-outline"
              active={isIndoor}
              onPress={() => setIsIndoor(true)}
            />
            <ToggleOption
              label="Outdoor"
              icon="leaf-outline"
              active={!isIndoor}
              onPress={() => setIsIndoor(false)}
            />
            <ToggleOption
              label="With kids"
              icon="people-outline"
              active={withKids}
              onPress={() => setWithKids(v => !v)}
            />
          </View>

          <Button
            label={loading ? 'Finding ideas...' : 'Generate Date Ideas'}
            onPress={handleGenerate}
            loading={loading}
            disabled={!profile}
            fullWidth
          />
        </Card>

        {/* Date idea results */}
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} />
            <Text style={styles.loadingText}>Thinking of ideas...</Text>
          </View>
        )}

        {ideas.length > 0 && (
          <View style={styles.ideasSection}>
            <Text style={styles.ideasLabel}>SUGGESTED IDEAS</Text>
            {ideas.map((idea, i) => (
              <Card key={i} style={styles.ideaCard}>
                <View style={styles.ideaNumber}>
                  <Text style={styles.ideaNumberText}>{i + 1}</Text>
                </View>
                <Text style={styles.ideaText}>{idea}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Emergency modes */}
        <View style={styles.emergencySection}>
          <Text style={styles.sectionTitle}>Emergency Modes</Text>
          <Text style={styles.emergencySubtitle}>
            Fast tools for common relationship moments
          </Text>

          <EmergencyCard
            icon="bandage-outline"
            label="Apology Mode"
            description="Generate a sincere apology for different situations"
            color={colors.accent}
            onPress={() => router.push({ pathname: '/emergency', params: { mode: 'apology' } })}
          />
          <EmergencyCard
            icon="refresh-outline"
            label="Reconnect Mode"
            description="For when things feel distant or cold"
            color="#7B8FE8"
            onPress={() => router.push({ pathname: '/emergency', params: { mode: 'reconnect' } })}
          />
          <EmergencyCard
            icon="trophy-outline"
            label="Celebration Mode"
            description="Good news, achievements, promotions"
            color={colors.success}
            onPress={() => router.push({ pathname: '/emergency', params: { mode: 'celebration' } })}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function ToggleOption({ label, icon, active, onPress }: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      style={[styles.toggleOpt, active && styles.toggleOptActive]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <Ionicons name={icon} size={14} color={active ? colors.background : colors.textSecondary} />
      <Text style={[styles.toggleOptText, active && styles.toggleOptTextActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

function EmergencyCard({ icon, label, description, color, onPress }: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  description: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.emergencyCard} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.emergencyIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <View style={styles.emergencyInfo}>
        <Text style={styles.emergencyLabel}>{label}</Text>
        <Text style={styles.emergencyDesc}>{description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { padding: spacing.lg, gap: spacing.lg, paddingBottom: spacing.xxl },
  title: { ...typography.h2, color: colors.text },
  subtitle: { ...typography.body, color: colors.textSecondary, marginTop: -spacing.sm },
  section: { gap: spacing.md },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  sectionTitle: { ...typography.h3, color: colors.text },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { ...typography.label, color: colors.textSecondary },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  chipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipText: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '500' },
  chipTextActive: { color: colors.background, fontWeight: '600' },
  toggleRow: { flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap' },
  toggleOpt: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  toggleOptActive: { backgroundColor: colors.surfaceElevated, borderColor: colors.primary },
  toggleOptText: { ...typography.bodySmall, color: colors.textSecondary },
  toggleOptTextActive: { color: colors.text },
  loadingWrap: { flexDirection: 'row', gap: spacing.sm, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
  ideasSection: { gap: spacing.sm },
  ideasLabel: { ...typography.label, color: colors.textSecondary },
  ideaCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  ideaNumber: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  ideaNumberText: { fontSize: 13, fontWeight: '700', color: colors.primary },
  ideaText: { ...typography.body, color: colors.text, flex: 1 },
  emergencySection: { gap: spacing.md },
  emergencySubtitle: { ...typography.body, color: colors.textSecondary, marginTop: -spacing.xs },
  emergencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
  },
  emergencyIcon: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emergencyInfo: { flex: 1 },
  emergencyLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
  emergencyDesc: { ...typography.bodySmall, color: colors.textSecondary, marginTop: 2 },
});
