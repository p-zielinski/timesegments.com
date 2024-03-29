import React from 'react';
import { Field } from 'formik';
import helperTextHandler from '../../sections/@dashboard/Form/helperTextHandler';
import { TextField as DefaultTextField } from '@mui/material';
import { StyledComponent } from 'styled-components';

type InputTextProps = {
  label?: string;
  name: string;
  type?: 'text' | 'date' | 'number' | 'password';
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
  TextField?: StyledComponent<any>;
  helperTextColor?: string;
  multiline?: boolean;
  rows?: number;
  inputBackground?: string;
};

export const InputText: React.FC<InputTextProps> = ({
  label,
  name,
  type = 'text',
  startAdornment,
  endAdornment,
  helperText,
  disabled = false,
  TextField = DefaultTextField,
  helperTextColor = '#888888',
  multiline = false,
  rows = 1,
  inputBackground = 'white',
}) => {
  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta }: { field: any; meta: any }) => {
        return (
          <TextField
            multiline={multiline}
            rows={rows}
            disabled={disabled}
            {...field}
            focused={
              !!(meta.initialValue !== meta.value && meta.value && !meta.error)
            }
            label={label}
            type={type}
            variant="outlined"
            size="small"
            autoComplete="nope"
            value={field.value || ''}
            InputLabelProps={{
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
                background: inputBackground,
              },
              startAdornment: startAdornment,
              endAdornment: endAdornment,
            }}
            className={'notchedOutline'}
            sx={{ mb: 1 }}
          />
        );
      }}
    </Field>
  );
};

export default InputText;
