import { describe, expect, it } from 'vitest'

import { createReviewDisputeSchema } from '@/features/disputes/schemas/reviewDisputeSchema'

const t = (key) => key

describe('createReviewDisputeSchema', () => {
  const schema = createReviewDisputeSchema(t)

  it('accepts valid APPROVE decision with non-empty note', () => {
    const result = schema.safeParse({ decision: 'APPROVE', note: 'Verified damaged item photos' })
    expect(result.success).toBe(true)
  })

  it('rejects blank note and notes over 1000 characters', () => {
    const emptyNote = schema.safeParse({ decision: 'REJECT', note: '   ' })
    expect(emptyNote.success).toBe(false)

    const longNote = schema.safeParse({ decision: 'REJECT', note: 'a'.repeat(1001) })
    expect(longNote.success).toBe(false)
  })

  it('rejects unsupported decision values', () => {
    const result = schema.safeParse({ decision: 'CANCEL', note: 'Invalid action' })
    expect(result.success).toBe(false)
  })
})
