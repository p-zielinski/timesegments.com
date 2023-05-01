import * as yup from 'yup';

export const equalTo = (ref, msg, referenceLabel) => {
  return yup.string().test({
    name: 'equalTo',
    exclusive: false,
    message: msg || '${path} must be the same as ' + referenceLabel,
    params: {
      reference: ref.path,
    },
    test: function (value) {
      return value === this.resolve(ref);
    },
  });
};
