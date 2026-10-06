import { CleanerCard } from '@/components/cleaner-bits';
import { Body, Loading, Notice, Screen } from '@/components/ui';
import { repository } from '@/data';
import { useData } from '@/lib/use-data';

export default function Kesfet() {
  const { data: cleaners, error } = useData(() => repository.listCleaners());
  if (!cleaners && !error) return <Loading />;

  return (
    <Screen>
      <Body>Size yakın {cleaners?.length ?? 0} temizlikçi. Ayrıntılar için karta dokunun.</Body>
      {error ? <Notice tone="danger">{error}</Notice> : null}
      {cleaners?.map((c) => <CleanerCard key={c.id} cleaner={c} />)}
    </Screen>
  );
}
