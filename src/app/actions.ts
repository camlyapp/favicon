'use server';

import { z } from 'zod';
import { generateFaviconVariations } from '@/ai/flows/generate-favicon-variations';

const actionSchema = z.object({
  faviconDataUri: z.string().refine(val => val.startsWith('data:image/'), {
    message: 'Must be a valid data URI for an image.',
  }),
});

export async function handleGenerateVariations(formData: FormData) {
  try {
    const validatedData = actionSchema.safeParse({
      faviconDataUri: formData.get('faviconDataUri'),
    });

    if (!validatedData.success) {
      console.error('Invalid input:', validatedData.error.flatten());
      return { error: 'Invalid input. Please provide a valid image.' };
    }

    const result = await generateFaviconVariations({
      faviconDataUri: validatedData.data.faviconDataUri,
      numVariations: 6,
    });

    if (!result || !result.variations || result.variations.length === 0) {
      return { error: 'Failed to generate variations. The AI model may be unavailable or returned no results.' };
    }

    return { variations: result.variations.map(v => v.imageDataUri) };
  } catch (e) {
    console.error('Error in handleGenerateVariations:', e);
    const errorMessage = e instanceof Error ? e.message : 'An unexpected error occurred.';
    return { error: `An unexpected error occurred: ${errorMessage}` };
  }
}
