import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface Promotion {
  id: string;
  slide_key: string;
  label: string;
  ends_at: string;
  is_active: boolean;
}

export function usePromotions() {
  return useQuery({
    queryKey: ['promotions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('is_active', true);
      if (error) throw error;
      return data as Promotion[];
    },
    staleTime: 60_000,
  });
}
