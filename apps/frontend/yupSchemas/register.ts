import * as yup from 'yup';
import recoverSchema from './recover';
import YupPassword from 'yup-password';

YupPassword(yup); // extend yup

const loginRegisterSchema = recoverSchema.concat(
  yup.object().shape({
    password: yup
      .string()
      .password()
      .minLowercase(1)
      .minUppercase(1)
      .minNumbers(1)
      .minSymbols(1)
      .min(5)
      .required(),
    timezone: yup.string().required(),
  })
);

export default loginRegisterSchema;
