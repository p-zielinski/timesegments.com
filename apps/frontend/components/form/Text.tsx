import React from 'react';
import { Field } from 'formik';
import TextField from '@mui/material/TextField';
import helperTextHandler from '../../helperFunctions/helperTextHandler';

type InputTextProps = {
  label?: string;
  name: string;
  type?: 'text' | 'date' | 'number' | 'password';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: string;
  isDisabled?: boolean;
  size?: 'small' | 'medium' | 'large';
};

export const InputText: React.FC<InputTextProps> = ({
  label,
  name,
  size = 'medium',
  type = 'text',
  startAdornment,
  endAdornment,
  helperText,
  isDisabled,
}) => {
  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta }: { field: any; meta: any }) => (
        <>
          <TextField
            disabled={isDisabled}
            {...field}
            focused={
              !!(meta.initialValue !== meta.value && meta.value && !meta.error)
            }
            label={label}
            type={type}
            size={size}
            autoComplete="nope"
            value={field.value || ''}
            InputLabelProps={{
              shrink: type === 'date' ? true : undefined,
              sx: {
                ml: 0,
              },
            }}
            error={!!(meta.touched && meta.error)}
            helperText={helperTextHandler(meta, helperText)}
            FormHelperTextProps={{
              sx: {
                mt:
                  helperText?.match(/optional/i) || helperText?.match(/dd\//i)
                    ? 0
                    : '-3px',
                ml: '4px',
                mb: helperText?.match(/optional/i) ? -0.3 : -1,
              },
            }}
            fullWidth
            InputProps={{
              startAdornment: startAdornment,
              endAdornment: endAdornment,
            }}
          />
        </>
      )}
    </Field>
  );
};
