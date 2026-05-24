import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import { GiftIdea } from '@/lib/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, spacing, typography, radius } from '@/constants/theme';

const STATUS_CONFIG: Record<GiftIdea['status'], { label: string; color: string }> = {
  idea: { label: 'Idea', color: colors.textSecondary },
  ordered: { label: 'Ordered', color: '#7B8FE8' },
  delivered: { label: 'Delivered', color: colors.primary },
  completed: { label: 'Done', color: colors.success },
};

export default function GiftPlannerScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [gifts, setGifts] = useState<GiftIdea[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: '',
    occasion: '',
    budget: '',
    link: '',
    notes: '',
    reminder_date: '',
  });

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    const { data } = await supabase
      .from('gift_ideas')
      .select('*')
      .eq('user_id', user!.id)
      .order('created_at', { ascending: false });
    setGifts(data ?? []);
  };

  const handleAdd = async () => {
    if (!form.title) {
      Alert.alert('Required', 'Enter a gift idea.');
      return;
    }
    setSaving(true);
    await supabase.from('gift_ideas').insert({
      user_id: user!.id,
      title: form.title,
      occasion: form.occasion || null,
      budget: form.budget ? parseFloat(form.budget) : null,
      link: form.link || null,
      notes: form.notes || null,
      reminder_date: form.reminder_date || null,
      status: 'idea',
    });
    await fetchGifts();
    setShowAdd(false);
    setForm({ title: '', occasion: '', budget: '', link: '', notes: '', reminder_date: '' });
    setSaving(false);
  };

  const updateStatus = async (id: string, status: GiftIdea['status']) => {
    await supabase.from('gift_ideas').update({ status }).eq('id', id);
    setGifts(prev => prev.map(g => g.id === id ? { ...g, status } : g));
  };

  const handleDelete = (id: string) => {
    Alert.alert('Remove Gift Idea', 'Remove this gift idea?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive', onPress: async () => {
          await supabase.from('gift_ideas').delete().eq('id', id);
          setGifts(prev => prev.filter(g => g.id !== id));
        }
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Gift Planner</Text>
        <TouchableOpacity
          style={styles.addBtn}
          onPress={() => setShowAdd(true)}
          activeOpacity={0.7}
        >
          <Ionicons name="add" size={20} color={colors.background} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {gifts.length === 0 && (
          <Card style={styles.emptyCard}>
            <Ionicons name="gift-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No gift ideas saved</Text>
            <Text style={styles.emptyBody}>
              Save ideas throughout the year so you're never scrambling at the last minute.
            </Text>
            <Button label="Add Gift Idea" onPress={() => setShowAdd(true)} />
          </Card>
        )}

        {gifts.map(gift => {
          const statusInfo = STATUS_CONFIG[gift.status];
          return (
            <Card key={gift.id} style={styles.giftCard}>
              <View style={styles.giftHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.giftTitle}>{gift.title}</Text>
                  {gift.occasion && <Text style={styles.giftOccasion}>{gift.occasion}</Text>}
                </View>
                <TouchableOpacity onPress={() => handleDelete(gift.id)}>
                  <Ionicons name="trash-outline" size={16} color={colors.textMuted} />
                </TouchableOpacity>
              </View>

              {(gift.budget || gift.reminder_date) && (
                <View style={styles.giftMeta}>
                  {gift.budget && (
                    <View style={styles.metaChip}>
                      <Ionicons name="cash-outline" size={12} color={colors.textSecondary} />
                      <Text style={styles.metaText}>${gift.budget}</Text>
                    </View>
                  )}
                  {gift.reminder_date && (
                    <View style={styles.metaChip}>
                      <Ionicons name="calendar-outline" size={12} color={colors.textSecondary} />
                      <Text style={styles.metaText}>{gift.reminder_date}</Text>
                    </View>
                  )}
                </View>
              )}

              {gift.notes && <Text style={styles.giftNotes}>{gift.notes}</Text>}

              <View style={styles.statusRow}>
                {(['idea', 'ordered', 'delivered', 'completed'] as GiftIdea['status'][]).map(s => (
                  <TouchableOpacity
                    key={s}
                    style={[
                      styles.statusChip,
                      gift.status === s && { backgroundColor: STATUS_CONFIG[s].color + '33', borderColor: STATUS_CONFIG[s].color },
                    ]}
                    onPress={() => updateStatus(gift.id, s)}
                    activeOpacity={0.7}
                  >
                    <Text style={[
                      styles.statusLabel,
                      gift.status === s && { color: STATUS_CONFIG[s].color },
                    ]}>
                      {STATUS_CONFIG[s].label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Card>
          );
        })}
      </ScrollView>

      <Modal visible={showAdd} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.safe}>
          <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Gift Idea</Text>
              <TouchableOpacity onPress={() => setShowAdd(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <Input
              label="Gift idea *"
              value={form.title}
              onChangeText={t => setForm(f => ({ ...f, title: t }))}
              placeholder="e.g. Gold bracelet, Spa day, Cookbook"
            />
            <Input
              label="Occasion"
              value={form.occasion}
              onChangeText={t => setForm(f => ({ ...f, occasion: t }))}
              placeholder="e.g. Birthday, Anniversary"
            />
            <Input
              label="Budget ($)"
              value={form.budget}
              onChangeText={t => setForm(f => ({ ...f, budget: t }))}
              placeholder="150"
              keyboardType="numeric"
            />
            <Input
              label="Link (optional)"
              value={form.link}
              onChangeText={t => setForm(f => ({ ...f, link: t }))}
              placeholder="https://..."
              keyboardType="url"
              autoCapitalize="none"
            />
            <Input
              label="Notes"
              value={form.notes}
              onChangeText={t => setForm(f => ({ ...f, notes: t }))}
              placeholder="Size, colour, where to buy..."
              multiline
              numberOfLines={2}
            />
            <Input
              label="Remind me by (YYYY-MM-DD)"
              value={form.reminder_date}
              onChangeText={t => setForm(f => ({ ...f, reminder_date: t }))}
              placeholder="2025-11-01"
              keyboardType="numbers-and-punctuation"
            />

            <Button label="Save Idea" onPress={handleAdd} loading={saving} fullWidth />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: { ...typography.h3, color: colors.text },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  emptyCard: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.xl },
  emptyTitle: { ...typography.h3, color: colors.text },
  emptyBody: { ...typography.body, color: colors.textSecondary, textAlign: 'center' },
  giftCard: { gap: spacing.sm },
  giftHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm },
  giftTitle: { ...typography.body, color: colors.text, fontWeight: '600' },
  giftOccasion: { ...typography.bodySmall, color: colors.textSecondary },
  giftMeta: { flexDirection: 'row', gap: spacing.sm },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.surfaceLight,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  metaText: { ...typography.caption, color: colors.textSecondary },
  giftNotes: { ...typography.bodySmall, color: colors.textSecondary },
  statusRow: { flexDirection: 'row', gap: spacing.xs, marginTop: spacing.xs },
  statusChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  statusLabel: { ...typography.caption, color: colors.textMuted, fontWeight: '600' },
  modalContent: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  modalTitle: { ...typography.h3, color: colors.text },
});
