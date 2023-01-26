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
  onChange?: (any) => unknown;
  disabled?: boolean;
};

export const Checkbox: React.FC<CheckboxProps> = ({
  label,
  name,
  hideHelpText,
  color,
  onChange,
  disabled = false,
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
                disabled={disabled}
                sx={{
                  m: -1,
                  ...colorSx,
                }}
                checked={field.value}
                {...field}
                value={field.value}
                onChange={
                  onChange ||
                  ((e) => form.setFieldValue(name, e.target.checked))
                }
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
