import { z } from 'zod';

const MarkSchema = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.union([z.string(), z.null()])).optional(),
});

const TipTapNodeSchema = z.object({
  type: z.string(),
  attrs: z.record(z.string(), z.union([z.string(), z.number(), z.null()])).optional(),
  get content(): z.ZodOptional<z.ZodArray<typeof TipTapNodeSchema>> {
    return z.array(TipTapNodeSchema).optional();
  },
  marks: z.array(MarkSchema).optional(),
  text: z.string().optional(),
});

export const TipTapDocSchema = z.object({
  type: z.literal('doc'),
  get content(): z.ZodOptional<z.ZodArray<typeof TipTapNodeSchema>> {
    return z.array(TipTapNodeSchema).optional();
  },
});

export type TipTapDoc = z.infer<typeof TipTapDocSchema>;
export type TipTapNode = z.infer<typeof TipTapNodeSchema>;
export type Mark = z.infer<typeof MarkSchema>;
