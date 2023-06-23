import { EmailType } from '@test1/shared';

export const emailsSpec = {
  [EmailType.EMAIL_CONTINUATION]: {
    unique: true,
    templateKey:
      '2d6f.6d40a782e57efe06.k1.089d5a40-0b60-11ee-b4c9-525400103106.188be6965e4',
    validFor: Infinity,
  },
  [EmailType.CHANGE_EMAIL_ADDRESS]: {
    unique: true,
    templateKey:
      '2d6f.6d40a782e57efe06.k1.089d5a40-0b60-11ee-b4c9-525400103106.188be6965e4',
    validFor: 1000 * 60 * 30,
  },
  [EmailType.RESET_PASSWORD]: {
    unique: true,
    templateKey:
      '2d6f.6d40a782e57efe06.k1.089d5a40-0b60-11ee-b4c9-525400103106.188be6965e4',
    validFor: 1000 * 60 * 30,
  },
};
