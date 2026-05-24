import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { useAuth } from '@/context/AuthContext';
import { PartnerProfile } from '@/lib/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors, spacing, typography, radius } from '@/constants/theme';

const RELATIONSHIP_TYPES: Array<{ value: PartnerProfile['relationship_type']; label: string }> = [
  { value: 'wife', label: 'Wife' },
  { value: 'girlfriend', label: 'Girlfriend' },
  { value: 'fiancée', label: 'Fiancée' },
  { value: 'partner', label: 'Partner' },
];

const LOVE_LANGUAGES = [
  'Words of affirmation',
  'Quality time',
  'Acts of service',
  'Gift giving',
  'Physical touch',
];

const TONES: Array<{ value: PartnerProfile['preferred_tone']; label: string }> = [
  { value: 'romantic', label: 'Romantic' },
  { value: 'funny', label: 'Funny' },
  { value: 'simple', label: 'Simple' },
  { value: 'deep', label: 'Deep' },
  { value: 'playful', label: 'Playful' },
  { value: 'apologetic', label: 'Apologetic' },
];

export default function ProfileScreen() {
  const { profile, loading, saveProfile } = usePartnerProfile();
  const { signOut, user } = useAuth();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    partner_name: '',
    relationship_type: 'girlfriend' as PartnerProfile['relationship_type'],
    birthday: '',
    anniversary_date: '',
    communication_style: '',
    love_language: '',
    preferred_tone: 'simple' as PartnerProfile['preferred_tone'],
    likes: '',
    dislikes: '',
    sensitive_topics: '',
    things_to_avoid: '',
    favourite_food: '',
    favourite_flowers: '',
    favourite_restaurants: '',
    religious_cultural_background: '',
  });

  useEffect(() => {
    if (profile) {
      setForm({
        partner_name: profile.partner_name ?? '',
        relationship_type: profile.relationship_type ?? 'girlfriend',
        birthday: profile.birthday ?? '',
        anniversary_date: profile.anniversary_date ?? '',
        communication_style: profile.communication_style ?? '',
        love_language: profile.love_language ?? '',
        preferred_tone: profile.preferred_tone ?? 'simple',
        likes: profile.likes?.join(', ') ?? '',
        dislikes: profile.dislikes?.join(', ') ?? '',
        sensitive_topics: profile.sensitive_topics?.join(', ') ?? '',
        things_to_avoid: profile.things_to_avoid ?? '',
        favourite_food: profile.favourite_food ?? '',
        favourite_flowers: profile.favourite_flowers ?? '',
        favourite_restaurants: profile.favourite_restaurants ?? '',
        religious_cultural_background: profile.religious_cultural_background ?? '',
      });
    } else if (!loading) {
      setEditing(true);
    }
  }, [profile, loading]);

  const handleSave = async () => {
    if (!form.partner_name) {
      Alert.alert('Required', "Enter your partner's name.");
      return;
    }
    setSaving(true);
    const success = await saveProfile({
      partner_name: form.partner_name,
      relationship_type: form.relationship_type,
      birthday: form.birthday || undefined,
      anniversary_date: form.anniversary_date || undefined,
      communication_style: form.communication_style || undefined,
      love_language: form.love_language || undefined,
      preferred_tone: form.preferred_tone,
      likes: form.likes ? form.likes.split(',').map(s => s.trim()).filter(Boolean) : [],
      dislikes: form.dislikes ? form.dislikes.split(',').map(s => s.trim()).filter(Boolean) : [],
      sensitive_topics: form.sensitive_topics ? form.sensitive_topics.split(',').map(s => s.trim()).filter(Boolean) : [],
      things_to_avoid: form.things_to_avoid || undefined,
      favourite_food: form.favourite_food || undefined,
      favourite_flowers: form.favourite_flowers || undefined,
      favourite_restaurants: form.favourite_restaurants || undefined,
      religious_cultural_background: form.religious_cultural_background || undefined,
    });
    if (success) setEditing(false);
    setSaving(false);
  };

  const handleSignOut = () => {
    Alert.alert('Sign Out', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign Out', style: 'destructive', onPress: signOut },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.centered}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={styles.title}>Partner Profile</Text>
          {profile && !editing && (
            <TouchableOpacity onPress={() => setEditing(true)} style={styles.editBtn}>
              <Ionicons name="pencil" size={16} color={colors.primary} />
              <Text style={styles.editText}>Edit</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* View mode */}
        {profile && !editing && (
          <View style={styles.viewMode}>
            <Card style={styles.profileCard}>
              <View style={styles.profileHeader}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>
                    {profile.partner_name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View>
                  <Text style={styles.profileName}>{profile.partner_name}</Text>
                  <Text style={styles.profileType}>{profile.relationship_type}</Text>
                </View>
              </View>
            </Card>

            {[
              { label: 'Love Language', value: profile.love_language },
              { label: 'Preferred Tone', value: profile.preferred_tone },
              { label: 'Communication Style', value: profile.communication_style },
              { label: 'Likes', value: profile.likes?.join(', ') },
              { label: 'Dislikes', value: profile.dislikes?.join(', ') },
              { label: 'Favourite Food', value: profile.favourite_food },
              { label: 'Favourite Flowers', value: profile.favourite_flowers },
            ].filter(f => f.value).map(f => (
              <Card key={f.label} style={styles.infoCard}>
                <Text style={styles.infoLabel}>{f.label}</Text>
                <Text style={styles.infoValue}>{f.value}</Text>
              </Card>
            ))}
          </View>
        )}

        {/* Edit mode */}
        {editing && (
          <View style={styles.form}>
            <Input
              label="Partner's name *"
              value={form.partner_name}
              onChangeText={t => setForm(f => ({ ...f, partner_name: t }))}
              placeholder="Sarah"
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Relationship type</Text>
              <View style={styles.chips}>
                {RELATIONSHIP_TYPES.map(rt => (
                  <TouchableOpacity
                    key={rt.value}
                    style={[styles.chip, form.relationship_type === rt.value && styles.chipActive]}
                    onPress={() => setForm(f => ({ ...f, relationship_type: rt.value }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, form.relationship_type === rt.value && styles.chipTextActive]}>
                      {rt.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Birthday (YYYY-MM-DD)"
              value={form.birthday}
              onChangeText={t => setForm(f => ({ ...f, birthday: t }))}
              placeholder="1990-06-15"
              keyboardType="numbers-and-punctuation"
            />

            <Input
              label="Anniversary (YYYY-MM-DD)"
              value={form.anniversary_date}
              onChangeText={t => setForm(f => ({ ...f, anniversary_date: t }))}
              placeholder="2019-09-20"
              keyboardType="numbers-and-punctuation"
            />

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Love language</Text>
              <View style={styles.chips}>
                {LOVE_LANGUAGES.map(ll => (
                  <TouchableOpacity
                    key={ll}
                    style={[styles.chip, form.love_language === ll && styles.chipActive]}
                    onPress={() => setForm(f => ({ ...f, love_language: ll }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, form.love_language === ll && styles.chipTextActive]}>{ll}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Preferred message tone</Text>
              <View style={styles.chips}>
                {TONES.map(t => (
                  <TouchableOpacity
                    key={t.value}
                    style={[styles.chip, form.preferred_tone === t.value && styles.chipActive]}
                    onPress={() => setForm(f => ({ ...f, preferred_tone: t.value }))}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipText, form.preferred_tone === t.value && styles.chipTextActive]}>{t.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Communication style"
              value={form.communication_style}
              onChangeText={t => setForm(f => ({ ...f, communication_style: t }))}
              placeholder="e.g. warm and simple"
            />

            <Input
              label="Things she likes (comma separated)"
              value={form.likes}
              onChangeText={t => setForm(f => ({ ...f, likes: t }))}
              placeholder="flowers, dinner dates, small surprises"
              multiline
              numberOfLines={2}
            />

            <Input
              label="Things she dislikes"
              value={form.dislikes}
              onChangeText={t => setForm(f => ({ ...f, dislikes: t }))}
              placeholder="generic messages, last-minute plans"
              multiline
              numberOfLines={2}
            />

            <Input
              label="Sensitive topics (comma separated)"
              value={form.sensitive_topics}
              onChangeText={t => setForm(f => ({ ...f, sensitive_topics: t }))}
              placeholder="e.g. her mother, weight, past relationship"
              multiline
              numberOfLines={2}
            />

            <Input
              label="Things to avoid saying"
              value={form.things_to_avoid}
              onChangeText={t => setForm(f => ({ ...f, things_to_avoid: t }))}
              placeholder="Specific phrases or topics to never include"
              multiline
              numberOfLines={2}
            />

            <Input
              label="Favourite food"
              value={form.favourite_food}
              onChangeText={t => setForm(f => ({ ...f, favourite_food: t }))}
              placeholder="e.g. Italian, sushi"
            />

            <Input
              label="Favourite flowers"
              value={form.favourite_flowers}
              onChangeText={t => setForm(f => ({ ...f, favourite_flowers: t }))}
              placeholder="e.g. peonies, roses"
            />

            <Input
              label="Favourite restaurants"
              value={form.favourite_restaurants}
              onChangeText={t => setForm(f => ({ ...f, favourite_restaurants: t }))}
              placeholder="e.g. Nobu, the little Italian place on George St"
            />

            <Input
              label="Religious / cultural background"
              value={form.religious_cultural_background}
              onChangeText={t => setForm(f => ({ ...f, religious_cultural_background: t }))}
              placeholder="e.g. Catholic, Hindu, Jewish"
            />

            <View style={styles.saveRow}>
              {profile && (
                <Button
                  label="Cancel"
                  onPress={() => setEditing(false)}
                  variant="secondary"
                  style={styles.cancelBtn}
                />
              )}
              <Button
                label="Save Profile"
                onPress={handleSave}
                loading={saving}
                style={profile ? styles.saveBtn : undefined}
                fullWidth={!profile}
              />
            </View>
          </View>
        )}

        {/* Account */}
        <Card style={styles.accountCard}>
          <Text style={styles.accountEmail}>{user?.email}</Text>
          <Button label="Sign Out" onPress={handleSignOut} variant="ghost" />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { ...typography.body, color: colors.textSecondary },
  container: { padding: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...typography.h2, color: colors.text },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  editText: { ...typography.body, color: colors.primary, fontWeight: '600' },
  viewMode: { gap: spacing.sm },
  profileCard: { gap: spacing.md },
  profileHeader: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '33',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 22, fontWeight: '700', color: colors.primary },
  profileName: { ...typography.h3, color: colors.text },
  profileType: { ...typography.body, color: colors.textSecondary, textTransform: 'capitalize' },
  infoCard: { gap: 4 },
  infoLabel: { ...typography.label, color: colors.textSecondary },
  infoValue: { ...typography.body, color: colors.text },
  form: { gap: spacing.md },
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
  saveRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  cancelBtn: { flex: 1 },
  saveBtn: { flex: 2 },
  accountCard: { gap: spacing.sm, alignItems: 'center', marginTop: spacing.md },
  accountEmail: { ...typography.bodySmall, color: colors.textSecondary },
});
