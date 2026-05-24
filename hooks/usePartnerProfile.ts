import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { PartnerProfile } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

export function usePartnerProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<PartnerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    fetchProfile();
  }, [user]);

  async function fetchProfile() {
    setLoading(true);
    const { data, error } = await supabase
      .from('partner_profiles')
      .select('*')
      .eq('user_id', user!.id)
      .maybeSingle();

    if (error) setError(error.message);
    else setProfile(data);
    setLoading(false);
  }

  async function saveProfile(updates: Partial<PartnerProfile>): Promise<boolean> {
    if (!user) return false;

    const payload = { ...updates, user_id: user.id };

    if (profile?.id) {
      const { error } = await supabase
        .from('partner_profiles')
        .update(payload)
        .eq('id', profile.id);
      if (error) { setError(error.message); return false; }
    } else {
      const { data, error } = await supabase
        .from('partner_profiles')
        .insert(payload)
        .select()
        .single();
      if (error) { setError(error.message); return false; }
      setProfile(data);
      return true;
    }

    await fetchProfile();
    return true;
  }

  return { profile, loading, error, saveProfile, refetch: fetchProfile };
}
