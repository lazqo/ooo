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
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { generateMessages } from '@/lib/openai';
import { MessageType, GeneratedMessages } from '@/lib/types';
import { Input } from '@/components/Input';
import { Button } from '@/components/Button';
import { MessageCard } from '@/components/MessageCard';
import { colors, spacing, typography, radius } from '@/constants/theme';

const MESSAGE_TYPES: Array<{ type: MessageType; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { type: 'good_morning', label: 'Good morning', icon: 'sunny-outline' },
  { type: 'midday_checkin', label: 'Check-in', icon: 'time-outline' },
  { type: 'good_night', label: 'Good night', icon: 'moon-outline' },
  { type: 'appreciation', label: 'Appreciation', icon: 'heart-outline' },
  { type: 'romantic', label: 'Romantic', icon: 'rose-outline' },
  { type: 'supportive', label: 'Supportive', icon: 'hand-left-outline' },
  { type: 'funny', label: 'Funny', icon: 'happy-outline' },
  { type: 'been_busy', label: "I've been busy", icon: 'briefcase-outline' },
  { type: 'anniversary', label: 'Anniversary', icon: 'ribbon-outline' },
  { type: 'birthday', label: 'Birthday', icon: 'gift-outline' },
  { type: 'celebration', label: 'Celebration', icon: 'trophy-outline' },
  { type: 'apology', label: 'Apology', icon: 'bandage-outline' },
];

export default function MessagesScreen() {
  const { profile } = usePartnerProfile();
  const [selectedType, setSelectedType] = useState<MessageType>('midday_checkin');
  const [context, setContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<GeneratedMessages | null>(null);

  const handleGenerate = async () => {
    if (!profile) {
      Alert.alert('No Profile', 'Set up your partner profile first.');
      return;
    }

    setLoading(true);
    setMessages(null);
    try {
      const result = await generateMessages(profile, selectedType, context || undefined);
      setMessages(result);
    } catch (e) {
      Alert.alert('Error', 'Could not generate messages. Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const selectedInfo = MESSAGE_TYPES.find(m => m.type === selectedType);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.title}>Message Generator</Text>
        <Text style={styles.subtitle}>
          {profile ? `For ${profile.partner_name}` : 'Set up a partner profile to personalise messages'}
        </Text>

        {/* Type selector */}
        <View style={styles.section}>
          <Text style={styles.label}>What kind of message?</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.typeScroll}
          >
            {MESSAGE_TYPES.map(item => (
              <TouchableOpacity
                key={item.type}
                style={[styles.typeChip, selectedType === item.type && styles.typeChipActive]}
                onPress={() => setSelectedType(item.type)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={item.icon}
                  size={14}
                  color={selectedType === item.type ? colors.background : colors.textSecondary}
                />
                <Text
                  style={[styles.typeLabel, selectedType === item.type && styles.typeLabelActive]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Context input */}
        <View style={styles.section}>
          <Input
            label="Add context (optional)"
            value={context}
            onChangeText={setContext}
            placeholder={`e.g. "She had a tough day at work" or "Our 5 year anniversary"`}
            multiline
            numberOfLines={2}
          />
        </View>

        {/* Generate button */}
        <Button
          label={loading ? 'Generating...' : `Generate ${selectedInfo?.label ?? ''} Message`}
          onPress={handleGenerate}
          loading={loading}
          disabled={!profile}
          fullWidth
        />

        {/* Results */}
        {loading && (
          <View style={styles.loadingWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
            <Text style={styles.loadingText}>Writing 3 versions for you...</Text>
          </View>
        )}

        {messages && !loading && (
          <View style={styles.results}>
            <Text style={styles.resultsLabel}>Choose one, copy, and send it yourself</Text>

            <MessageCard
              label="Simple & Natural"
              icon="chatbubble-outline"
              message={messages.simple}
              accent={colors.textSecondary}
            />
            <MessageCard
              label="Warm & Genuine"
              icon="heart-outline"
              message={messages.romantic}
              accent={colors.primary}
            />
            <MessageCard
              label="Light & Playful"
              icon="happy-outline"
              message={messages.playful}
              accent="#7B8FE8"
            />

            <View style={styles.disclaimer}>
              <Ionicons name="information-circle-outline" size={14} color={colors.textMuted} />
              <Text style={styles.disclaimerText}>
                Review and edit before sending. You stay in control.
              </Text>
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  container: {
    padding: spacing.lg,
    paddingBottom: spacing.xxl,
    gap: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: -spacing.sm,
  },
  section: {
    gap: spacing.sm,
  },
  label: {
    ...typography.label,
    color: colors.textSecondary,
  },
  typeScroll: {
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  typeChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.surface,
    borderRadius: radius.full,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  typeChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  typeLabel: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  typeLabelActive: {
    color: colors.background,
    fontWeight: '600',
  },
  loadingWrap: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  loadingText: {
    ...typography.body,
    color: colors.textSecondary,
  },
  results: {
    gap: spacing.md,
  },
  resultsLabel: {
    ...typography.label,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  disclaimer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  disclaimerText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
