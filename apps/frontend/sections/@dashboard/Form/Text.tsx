import React from 'react';
import { Field } from 'formik';
import helperTextHandler from './helperTextHandler';
import { TextField as DefaultTextField } from '@mui/material';
import { StyledComponent } from 'styled-components';

type InputTextProps = {
  label?: string;
  name: string;
  type?: 'text' | 'date' | 'number' | 'password';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: string;
  isDisabled?: boolean;
  TextField?: StyledComponent<any>;
  helperTextColor?: string;
};

export const InputText: React.FC<InputTextProps> = ({
  label,
  name,

  type = 'text',
  startAdornment,
  endAdornment,
  helperText,
  isDisabled,
  TextField = DefaultTextField,
  helperTextColor = '#888888',
}) => {
  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta }: { field: any; meta: any }) => {
        return (
          <>
            <TextField
              key={'dsds'}
              disabled={isDisabled}
              {...field}
              focused={
                !!(
                  meta.initialValue !== meta.value &&
                  meta.value &&
                  !meta.error
                )
              }
              label={label}
              type={type}
              variant="outlined"
              size="small"
              autoComplete="nope"
              value={field.value || ''}
              InputLabelProps={{
                required: true,
                sx: {
                  background: 'rgba(255,255,255,.5)',
                  borderRadius: '7px',
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
                  color: helperTextColor,
                },
              }}
              fullWidth
              InputProps={{
                sx: {
                  background: 'white',
                },
                startAdornment: startAdornment,
                endAdornment: endAdornment,
              }}
              className={'notchedOutline'}
              sx={{ mb: 1 }}
            />
          </>
        );
      }}
    </Field>
  );
};

export default InputText;
