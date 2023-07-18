import React from 'react';
import { Field } from 'formik';
import FormControl from '@mui/material/FormControl';
import { TimePicker as MuiTimePicker } from '@mui/x-date-pickers/TimePicker';
import helperTextHandler from '../../sections/@dashboard/Form/helperTextHandler';
import { Box } from '@mui/material';

type DatePickerProps = {
  label?: string;
  name: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
  getTextFieldProps?: (error, focused) => Record<string, any>;
  helperTextColor?: string;
  multiline?: boolean;
  rows?: number;
  inputBackground?: string;
  initialFocused?: boolean;
};

export const TimePicker = ({
  label,
  name,
  startAdornment,
  endAdornment,
  helperText,
  disabled = false,
  getTextFieldProps = (error, focused) => {
    return {};
  },
  helperTextColor = '#888888',
  inputBackground = 'white',
  initialFocused = false,
}: DatePickerProps) => {
  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta, form }) => {
        const focused =
          initialFocused ||
          !!(meta.initialValue !== meta.value && meta.value && !meta.error);
        const helperText = helperTextHandler(meta);
        const error = !!meta.touched && !!meta.error;
        return (
          <FormControl
            size="small"
            sx={{ width: '100%', mb: 1 }}
            error={!!meta.touched && !!meta.error}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <MuiTimePicker
                focused={
                  !!(
                    meta.initialValue !== meta.value &&
                    meta.value &&
                    !meta.error
                  )
                }
                slotProps={{
                  textField: {
                    background: 'white',
                    sx: getTextFieldProps(error, focused),
                    size: 'small',
                  },
                }}
                disableFuture={true}
                showTodayButton={false}
                disabled={disabled}
                label={label}
                variant="filled"
                size="small"
                allowSameDateSelection={true}
                {...field}
                value={field.value || null}
                onChange={(value) => form.setFieldValue(field.name, value)}
                InputProps={{
                  startAdornment: startAdornment,
                }}
              />
              <Box
                sx={{
                  mt:
                    helperText?.match(/optional/i) || helperText?.match(/dd\//i)
                      ? 0
                      : '-3px',
                  ml: '4px',
                  mb: helperText?.match(/optional/i) ? -0.3 : -1,
                  color: error ? '#FF4842' : helperTextColor,
                  lineHeight: '1.5',
                  fontSize: '0.75rem',
                  fontFamily: `Public Sans,sans-serif`,
                }}
              >
                {helperText}
              </Box>
            </Box>
          </FormControl>
        );
      }}
    </Field>
  );
};

export default TimePicker;
