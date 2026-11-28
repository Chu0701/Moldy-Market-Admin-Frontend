import { z } from 'zod'

/** Lý do mẫu hiển thị trong hộp thoại khóa. Giá trị gửi lên Backend là text đã ghép. */
export const LOCK_REASON_PRESETS = ['SPAM', 'SCAM', 'PROHIBITED_ITEMS', 'HARASSMENT', 'FAKE_ACCOUNT', 'OTHER']

export const LOCK_REASON_MIN = 10
export const LOCK_REASON_MAX = 500

/** @param {import('i18next').TFunction} t */
export function createLockUserSchema(t) {
  return z.object({
    preset: z.enum(LOCK_REASON_PRESETS, { message: t('users.validation.presetRequired') }),
    detail: z
      .string()
      .trim()
      .min(5, t('users.validation.detailRequired'))
      .max(LOCK_REASON_MAX - 40, t('users.validation.detailTooLong')),
  })
}

/** @param {import('i18next').TFunction} t */
export function createUnlockUserSchema(t) {
  return z.object({
    note: z.string().trim().max(LOCK_REASON_MAX, t('users.validation.noteTooLong')),
  })
}

/**
 * Ghép lý do mẫu + mô tả thành chuỗi gửi Backend, ví dụ "[Spam] Đăng 50 bài trùng lặp".
 * Backend yêu cầu 10–500 ký tự; tiền tố giúp lọc / thống kê sau này.
 * @param {string} presetLabel
 * @param {string} detail
 */
export function buildLockReason(presetLabel, detail) {
  return `[${presetLabel}] ${detail.trim()}`.slice(0, LOCK_REASON_MAX)
}