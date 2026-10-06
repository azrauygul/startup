import { MockRepository } from './mock-repository';
import type { Repository } from './repository';
import { SupabaseRepository } from './supabase-repository';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const anonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const supabaseConfigured = Boolean(url?.startsWith('http') && anonKey);

export const repository: Repository = supabaseConfigured
  ? new SupabaseRepository(url!, anonKey!)
  : new MockRepository();

export { RepositoryError } from './repository';
export type { Repository, PickedFile } from './repository';
