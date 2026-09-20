import { z } from 'zod';

const Env = z.object({
  AUTO_SEARCH_INTERVAL_MS: z.coerce.number().int().min(1000).max(60000).default(5000),
  AUTO_SEARCH_BATCH: z.coerce.number().int().min(1).max(500).default(100),
  AUTO_SEARCH_STALE_POSITION_MINUTES: z.coerce.number().int().min(1).max(1440).default(30),
});

export const v17Config = Env.parse(process.env);
