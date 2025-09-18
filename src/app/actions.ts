'use server';

import { z } from 'zod';

const actionSchema = z.object({
  faviconDataUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: 'Must be a valid data URI for an image.',
  }),
});
