import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@/context/AuthContext';
import { usePartnerProfile } from '@/hooks/usePartnerProfile';
import { useDates } from '@/hooks/useDates';
import { Card } from '@/components/Card';
import { Button } from '@/components/Button';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { requestNotificationPermissions, scheduleDailyCheckinReminder } from '@/lib/notifications';

const CATEGORY_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  birthday: 'gift',
  anniversary: 'heart',
  holiday: 'star',
  custom: 'calendar',
};

export default function DashboardScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { profile, loading: profileLoading } = usePartnerProfile();
  const { getUpcomingDates, loading: datesLoading } = useDates();
  const [refreshing, setRefreshing] = React.useState(false);

  const upcomingDates = getUpcomingDates(30);
  const nextDate = upcomingDates[0];

  useEffect(() => {
    requestNotificationPermissions().then(granted => {
      if (granted) scheduleDailyCheckinReminder(9);
    });
  }, []);

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const userName = user?.user_metadata?.name?.split(' ')[0] || 'there';
  const partnerName = profile?.partner_name || 'your partner';

  const greetingHour = new Date().getHours();
  const greeting =
    greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>{greeting}, {userName}</Text>
            <Text style={styles.subGreeting}>
              {profile ? `Connected with ${partnerName}` : 'Set up your partner profile'}
            </Text>
          </View>
          <View style={styles.logo}>
            <Text style={styles.logoText}>PP</Text>
          </View>
        </View>

        {/* No profile prompt */}
        {!profileLoading && !profile && (
          <Card style={styles.setupCard}>
            <Ionicons name="heart-outline" size={32} color={colors.primary} />
            <Text style={styles.setupTitle}>Set up your partner profile</Text>
            <Text style={styles.setupBody}>
              Add your partner's details so PartnerPilot can generate personalised messages and reminders.
            </Text>
            <Button
              label="Set Up Profile"
              onPress={() => router.push('/(tabs)/profile')}
              fullWidth
            />
          </Card>
        )}

        {/* Today's action */}
        {profile && (
          <Card style={styles.todayCard} elevated>
            <View style={styles.todayHeader}>
              <Text style={styles.todayLabel}>TODAY'S MOVE</Text>
              <View style={styles.goldDot} />
            </View>
            <Text style={styles.todayTitle}>Send {partnerName} a message</Text>
            <Text style={styles.todayBody}>
              A small check-in goes a long way. Takes 10 seconds.
            </Text>
            <Button
              label="Generate a Message"
              onPress={() => router.push('/(tabs)/messages')}
              fullWidth
            />
          </Card>
        )}

        {/* Upcoming dates */}
        {upcomingDates.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Upcoming</Text>
              <TouchableOpacity onPress={() => router.push('/(tabs)/calendar')}>
                <Text style={styles.sectionLink}>See all</Text>
              </TouchableOpacity>
            </View>

            {upcomingDates.slice(0, 3).map(date => (
              <Card key={date.id} style={styles.dateCard}>
                <View style={styles.dateIconWrap}>
                  <Ionicons
                    name={CATEGORY_ICONS[date.category] ?? 'calendar'}
                    size={20}
                    color={date.daysUntil <= 7 ? colors.accent : colors.primary}
                  />
                </View>
                <View style={styles.dateInfo}>
                  <Text style={styles.dateTitle}>{date.title}</Text>
                  <Text style={styles.dateSub}>
                    {date.daysUntil === 0
                      ? 'Today'
                      : date.daysUntil === 1
                      ? 'Tomorrow'
                      : `In ${date.daysUntil} days`}
                  </Text>
                </View>
                {date.daysUntil <= 7 && (
                  <View style={styles.urgentBadge}>
                    <Text style={styles.urgentText}>Soon</Text>
                  </View>
                )}
              </Card>
            ))}
          </View>
        )}

        {/* Quick actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActions}>
            <QuickAction
              icon="warning"
              label="Emergency Mode"
              color={colors.accent}
              onPress={() => router.push('/emergency')}
            />
            <QuickAction
              icon="gift-outline"
              label="Gift Planner"
              color={colors.primary}
              onPress={() => router.push('/gift-planner')}
            />
            <QuickAction
              icon="restaurant-outline"
              label="Date Night"
              color="#7B8FE8"
              onPress={() => router.push('/(tabs)/planner')}
            />
            <QuickAction
              icon="calendar-outline"
              label="Add Date"
              color={colors.success}
              onPress={() => router.push('/(tabs)/calendar')}
            />
          </View>
        </View>

        {/* Privacy note */}
        <View style={styles.privacyNote}>
          <Ionicons name="lock-closed" size={12} color={colors.textMuted} />
          <Text style={styles.privacyText}>
            Private & secure. Messages are never sent automatically.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  color,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  color: string;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity style={styles.quickAction} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '22' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { flex: 1 },
  container: {
    padding: spacing.lg,
    gap: spacing.lg,
    paddingBottom: spacing.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    ...typography.h2,
    color: colors.text,
  },
  subGreeting: {
    ...typography.bodySmall,
    color: colors.textSecondary,
    marginTop: 2,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary + '22',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.primary,
  },
  setupCard: {
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.xl,
  },
  setupTitle: {
    ...typography.h3,
    color: colors.text,
    textAlign: 'center',
  },
  setupBody: {
    ...typography.body,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  todayCard: {
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  todayHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  todayLabel: {
    ...typography.label,
    color: colors.primary,
  },
  goldDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  todayTitle: {
    ...typography.h3,
    color: colors.text,
  },
  todayBody: {
    ...typography.body,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  section: {
    gap: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
  },
  sectionLink: {
    ...typography.bodySmall,
    color: colors.primary,
    fontWeight: '600',
  },
  dateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  dateIconWrap: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dateInfo: {
    flex: 1,
  },
  dateTitle: {
    ...typography.body,
    color: colors.text,
    fontWeight: '500',
  },
  dateSub: {
    ...typography.bodySmall,
    color: colors.textSecondary,
  },
  urgentBadge: {
    backgroundColor: colors.accent + '33',
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
  },
  urgentText: {
    ...typography.caption,
    color: colors.accent,
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  quickAction: {
    width: '47%',
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  quickActionIcon: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionLabel: {
    ...typography.bodySmall,
    color: colors.text,
    fontWeight: '600',
  },
  privacyNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    justifyContent: 'center',
  },
  privacyText: {
    ...typography.caption,
    color: colors.textMuted,
  },
});
