import { useQuery } from '@tanstack/react-query';

import { getLibrarySeries, getRecentChapters } from '../db/queries';
import { groupUpdates } from './updateGrouping';

export function useLibrarySeries() {
  return useQuery({ queryKey: ['library', 'series'], queryFn: getLibrarySeries });
}

export function useUpdates() {
  return useQuery({
    queryKey: ['library', 'updates'],
    queryFn: async () => groupUpdates(await getRecentChapters()),
  });
}
