import React from 'react';
import { Field } from 'formik';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormHelperText from '@mui/material/FormHelperText';
import { Checkbox as CheckboxMui } from '@mui/material';

type CheckboxProps = {
  label?: string;
  name: string;
  saveAsString?: boolean;
  hideHelpText?: boolean;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  saveAsString,
  hideHelpText,
}) => {
  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta, form }) => (
        <>
          <FormControlLabel
            control={
              <CheckboxMui
                checked={field.value?.match(/true/i) ? true : false}
                {...field}
                value={field.value}
                onChange={(e) => {
                  form.setFieldValue(
                    name,
                    saveAsString
                      ? e.target.checked.toString()
                      : e.target.checked
                  );
                }}
              />
            }
            label={label}
          />
          {!hideHelpText && <FormHelperText>{meta.error}</FormHelperText>}
        </>
      )}
    </Field>
  );
};
