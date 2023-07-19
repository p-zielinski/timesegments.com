import React from 'react';
import { Field } from 'formik';
import FormControl from '@mui/material/FormControl';
import helperTextHandler from '../../sections/@dashboard/Form/helperTextHandler';
import { Box } from '@mui/material';
import { DateTimePicker as MuiDateTimePicker } from '@mui/x-date-pickers/DateTimePicker';

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
  timezone: string;
};

export const DateTimePicker = ({
  timezone,
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
}: DatePickerProps) => {
  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta, form }) => {
        const focused = !!(
          meta.initialValue !== meta.value &&
          meta.value &&
          !meta.error
        );
        const helperText = helperTextHandler(meta);
        const error = !!meta.touched && !!meta.error;
        return (
          <FormControl size="small" sx={{ width: '100%' }} error={error}>
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
              }}
            >
              <MuiDateTimePicker
                slotProps={{
                  textField: {
                    background: 'white',
                    sx: getTextFieldProps(error, error ? false : focused),
                    size: 'small',
                  },
                }}
                disableFuture={true}
                showTodayButton={false}
                disabled={disabled}
                label={label}
                variant="filled"
                size="small"
                allowClear={true}
                timezone={timezone}
                allowSameDateSelection={true}
                {...field}
                value={field.value || null}
                onChange={(value) => {
                  form.setFieldTouched(field.name, true);
                  form.setFieldValue(field.name, value);
                }}
                InputProps={{
                  startAdornment: startAdornment,
                }}
                onClose={() => console.log(123)}
              />
              <Box
                sx={{
                  mt: '6px',
                  ml: '4px',
                  mb: -1,
                  color: error ? '#FF4842' : helperTextColor,
                  fontSize: '0.75rem',
                  fontFamily: `Public Sans,sans-serif`,
                  minHeight: '14px',
                  lineHeight: 0,
                }}
              >
                {!disabled && helperText}
              </Box>
            </Box>
          </FormControl>
        );
      }}
    </Field>
  );
};

export default DateTimePicker;
