import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { ImportantDate } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function useDates() {
  const { user } = useAuth();
  const [dates, setDates] = useState<ImportantDate[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchDates();
  }, [user]);

  async function fetchDates() {
    setLoading(true);
    const { data } = await supabase
      .from('important_dates')
      .select('*')
      .eq('user_id', user!.id)
      .order('date', { ascending: true });
    setDates(data ?? []);
    setLoading(false);
  }

  async function addDate(date: Omit<ImportantDate, 'id' | 'user_id'>): Promise<boolean> {
    const { error } = await supabase
      .from('important_dates')
      .insert({ ...date, user_id: user!.id });
    if (error) return false;
    await fetchDates();
    return true;
  }

  async function removeDate(id: string): Promise<void> {
    await supabase.from('important_dates').delete().eq('id', id);
    setDates(prev => prev.filter(d => d.id !== id));
  }

  function getUpcomingDates(days = 60): Array<ImportantDate & { daysUntil: number }> {
    const now = new Date();
    const result: Array<ImportantDate & { daysUntil: number }> = [];

    for (const d of dates) {
      const eventDate = new Date(d.date);

      if (d.repeats_yearly) {
        eventDate.setFullYear(now.getFullYear());
        if (eventDate < now) eventDate.setFullYear(now.getFullYear() + 1);
      }

      const daysUntil = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      if (daysUntil >= 0 && daysUntil <= days) {
        result.push({ ...d, daysUntil });
      }
    }

    return result.sort((a, b) => a.daysUntil - b.daysUntil);
  }

  return { dates, loading, addDate, removeDate, getUpcomingDates, refetch: fetchDates };
}
