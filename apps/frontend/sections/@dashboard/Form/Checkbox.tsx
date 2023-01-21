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
  color?: string;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  saveAsString,
  hideHelpText,
  color,
}) => {
  const colorSx = color
    ? {
        fontColor: color,
        color,
        '&.Mui-checked': {
          color,
        },
      }
    : {};

  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta, form }) => (
        <>
          <FormControlLabel
            control={
              <CheckboxMui
                sx={{
                  m: -1,
                  ...colorSx,
                }}
                checked={field.value}
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
            label={<span style={{ color: color }}>{label}</span>}
          />
          {!hideHelpText && <FormHelperText>{meta.error}</FormHelperText>}
        </>
      )}
    </Field>
  );
};
