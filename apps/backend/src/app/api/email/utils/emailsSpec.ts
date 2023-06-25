import { EmailType } from '@test1/shared';

export const emailsSpec = {
  [EmailType.EMAIL_CONFIRMATION]: {
    unique: true,
    templateKey:
      '2d6f.6d40a782e57efe06.k1.089d5a40-0b60-11ee-b4c9-525400103106.188be6965e4',
    validFor: Infinity,
  },
  [EmailType.CHANGE_EMAIL_ADDRESS]: {
    unique: true,
    templateKey:
      '2d6f.6d40a782e57efe06.k1.54dc22a0-136d-11ee-b6ac-525400d6cd4f.188f32e51ca',
    validFor: 1000 * 60 * 60,
  },
  [EmailType.RESET_PASSWORD]: {
    unique: true,
    templateKey:
      '2d6f.6d40a782e57efe06.k1.5c6cbd50-136c-11ee-b6ac-525400d6cd4f.188f327f5a5',
    validFor: 1000 * 60 * 60,
  },
};
