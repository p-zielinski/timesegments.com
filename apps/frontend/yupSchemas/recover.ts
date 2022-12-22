import * as yup from "yup";
import emailRegexp from '../regex/email';

const recoverSchema = yup.object().shape({
  email: yup
    .string()
    .matches(emailRegexp, "Please enter a valid email")
    .required(),
});

export default recoverSchema;
