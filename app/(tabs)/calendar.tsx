import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useDates } from '@/hooks/useDates';
import { ImportantDate } from '@/lib/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { scheduleDateReminder } from '@/lib/notifications';

const CATEGORIES: Array<{ value: ImportantDate['category']; label: string; icon: keyof typeof Ionicons.glyphMap; color: string }> = [
  { value: 'birthday', label: 'Birthday', icon: 'gift-outline', color: colors.accent },
  { value: 'anniversary', label: 'Anniversary', icon: 'heart-outline', color: colors.primary },
  { value: 'holiday', label: 'Holiday', icon: 'star-outline', color: '#7B8FE8' },
  { value: 'custom', label: 'Custom', icon: 'calendar-outline', color: colors.success },
];

const DEFAULT_REMINDER_DAYS = [30, 14, 7, 1, 0];

export default function CalendarScreen() {
  const { dates, loading, addDate, removeDate, getUpcomingDates } = useDates();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    title: '',
    date: '',
    category: 'birthday' as ImportantDate['category'],
    repeats_yearly: true,
    notes: '',
  });
  const [saving, setSaving] = useState(false);

  const upcoming = getUpcomingDates(365);

  const handleAdd = async () => {
    if (!form.title || !form.date) {
      Alert.alert('Missing info', 'Please enter a title and date.');
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(form.date)) {
      Alert.alert('Invalid date', 'Use format YYYY-MM-DD (e.g. 1990-06-15)');
      return;
    }

    setSaving(true);
    const success = await addDate({
      title: form.title,
      date: form.date,
      category: form.category,
      repeats_yearly: form.repeats_yearly,
      reminder_days_before: DEFAULT_REMINDER_DAYS,
      notes: form.notes || undefined,
    });

    if (success) {
      const newDate = dates.find(d => d.title === form.title);
      if (newDate) await scheduleDateReminder(newDate);
      setShowAdd(false);
      setForm({ title: '', date: '', category: 'birthday', repeats_yearly: true, notes: '' });
    }
    setSaving(false);
  };

  const handleDelete = (id: string, title: string) => {
    Alert.alert('Remove Date', `Remove "${title}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => removeDate(id) },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Important Dates</Text>
          <TouchableOpacity style={styles.addBtn} onPress={() => setShowAdd(true)} activeOpacity={0.7}>
            <Ionicons name="add" size={22} color={colors.background} />
          </TouchableOpacity>
        </View>

        {loading && <Text style={styles.emptyText}>Loading...</Text>}

        {!loading && upcoming.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="calendar-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No dates added yet</Text>
            <Text style={styles.emptyBody}>
              Add birthdays, anniversaries, and other important occasions to get reminded in advance.
            </Text>
            <Button label="Add a Date" onPress={() => setShowAdd(true)} />
          </Card>
        )}

        {upcoming.map(date => {
          const cat = CATEGORIES.find(c => c.value === date.category);
          return (
            <Card key={date.id} style={styles.dateCard}>
              <View style={[styles.catIcon, { backgroundColor: (cat?.color ?? colors.primary) + '22' }]}>
                <Ionicons name={cat?.icon ?? 'calendar-outline'} size={20} color={cat?.color ?? colors.primary} />
              </View>

              <View style={styles.dateInfo}>
                <Text style={styles.dateTitle}>{date.title}</Text>
                <Text style={styles.dateMeta}>
                  {date.date} {date.repeats_yearly ? '· Yearly' : ''}
                </Text>
                {date.notes ? <Text style={styles.dateNotes}>{date.notes}</Text> : null}
              </View>

              <View style={styles.dateRight}>
                <View style={[
                  styles.countdownBadge,
                  { backgroundColor: date.daysUntil <= 7 ? colors.accent + '33' : colors.surfaceLight }
                ]}>
                  <Text style={[
                    styles.countdownText,
                    { color: date.daysUntil <= 7 ? colors.accent : colors.textSecondary }
                  ]}>
                    {date.daysUntil === 0 ? 'TODAY' : `${date.daysUntil}d`}
                  </Text>
                </View>

                <TouchableOpacity onPress={() => handleDelete(date.id, date.title)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                  <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>
            </Card>
          );
        })}
      </ScrollView>

      {/* Add date modal */}
      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Important Date</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Title"
              value={form.title}
              onChangeText={t => setForm(f => ({ ...f, title: t }))}
              placeholder="e.g. Sarah's Birthday"
            />

            <Input
              label="Date (YYYY-MM-DD)"
              value={form.date}
              onChangeText={t => setForm(f => ({ ...f, date: t }))}
              placeholder="1990-06-15"
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Category</Text>
              <View style={styles.catGrid}>
                {CATEGORIES.map(cat => (
                  <TouchableOpacity
                    key={cat.value}
                    style={[styles.catChip, form.category === cat.value && { borderColor: cat.color, backgroundColor: cat.color + '22' }]}
                    onPress={() => setForm(f => ({ ...f, category: cat.value }))}
                    activeOpacity={0.7}
                  >
                    <Ionicons name={cat.icon} size={16} color={form.category === cat.value ? cat.color : colors.textSecondary} />
                    <Text style={[styles.catLabel, form.category === cat.value && { color: cat.color }]}>{cat.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <TouchableOpacity
              style={styles.toggleRow}
              onPress={() => setForm(f => ({ ...f, repeats_yearly: !f.repeats_yearly }))}
              activeOpacity={0.7}
            >
              <Text style={styles.toggleLabel}>Repeats yearly</Text>
              <View style={[styles.toggle, form.repeats_yearly && styles.toggleOn]}>
                <View style={[styles.toggleThumb, form.repeats_yearly && styles.toggleThumbOn]} />
              </View>
            </TouchableOpacity>

            <Input
              label="Notes (optional)"
              value={form.notes}
              onChangeText={t => setForm(f => ({ ...f, notes: t }))}
              placeholder="e.g. She loves roses"
              multiline
              numberOfLines={2}
            />

            <View style={styles.reminderNote}>
              <Ionicons name="notifications-outline" size={14} color={colors.textSecondary} />
              <Text style={styles.reminderNoteText}>
                You'll be reminded 30, 14, 7, and 1 day before, plus on the day.
              </Text>
            </View>

            <Button label="Save Date" onPress={handleAdd} loading={saving} fullWidth />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, color: colors.text },
  addBtn: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  emptyCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  catIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: { flex: 1, gap: 2 },
  dateTitle: { ...typography.body, color: colors.text, fontWeight: '500' },
  dateMeta: { ...typography.bodySmall, color: colors.textSecondary },
  dateNotes: { ...typography.caption, color: colors.textMuted, marginTop: 2 },
  dateRight: { alignItems: 'flex-end', gap: spacing.sm },
  countdownBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  countdownText: { ...typography.label, fontSize: 11 },
  modalSafe: { flex: 1, backgroundColor: colors.background },
  modalContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { ...typography.h3, color: colors.text },
  fieldGroup: { gap: spacing.sm },
  fieldLabel: { ...typography.label, color: colors.textSecondary },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  catChip: {
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
  catLabel: { ...typography.bodySmall, color: colors.textSecondary, fontWeight: '500' },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  toggleLabel: { ...typography.body, color: colors.text },
  toggle: {
    width: 44,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.surfaceElevated,
    padding: 2,
    justifyContent: 'center',
  },
  toggleOn: { backgroundColor: colors.primary },
  toggleThumb: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.textMuted,
  },
  toggleThumbOn: {
    backgroundColor: colors.background,
    alignSelf: 'flex-end',
  },
  reminderNote: {
    flexDirection: 'row',
    gap: spacing.xs,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.md,
    padding: spacing.md,
    alignItems: 'flex-start',
  },
  reminderNoteText: { ...typography.bodySmall, color: colors.textSecondary, flex: 1, lineHeight: 18 },
});
