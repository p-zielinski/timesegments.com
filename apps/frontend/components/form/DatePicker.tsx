import React from 'react';
import { Field } from 'formik';
import FormControl from '@mui/material/FormControl';
import helperTextHandler from '../../sections/@dashboard/Form/helperTextHandler';
import { Box } from '@mui/material';
import { DatePicker as MuiDatePicker } from '@mui/x-date-pickers/DatePicker';

type DatePickerProps = {
  label?: string;
  name: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
  getTextFieldProps?: (error, focused, disabled) => Record<string, any>;
  helperTextColor?: string;
  multiline?: boolean;
  rows?: number;
  inputBackground?: string;
  timezone: string;
  onChangeFnc?: (value) => void;
  shouldDisableDate?: (value) => boolean;
};

export const DatePicker = ({
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
  onChangeFnc = (value) => undefined,
  shouldDisableDate = (date) => false,
}: DatePickerProps) => {
  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta, form }) => {
        const focused = !!(
          meta.initialValue !== meta.value &&
          meta.value &&
          !meta.error
        );
        const helperText = helperTextHandler(meta, '', `&nbsp;`, false, true);
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
              <MuiDatePicker
                slotProps={{
                  textField: {
                    background: 'white',
                    sx: getTextFieldProps(
                      error,
                      error ? false : focused,
                      disabled
                    ),
                    size: 'small',
                  },
                }}
                disableFuture={true}
                shouldDisableDate={shouldDisableDate}
                showTodayButton={false}
                disabled={disabled}
                label={label}
                variant="filled"
                size="small"
                format={'DDDD'}
                allowClear={true}
                timezone={timezone}
                allowSameDateSelection={true}
                {...field}
                value={field.value || null}
                onChange={(value) => {
                  if (typeof onChangeFnc === 'function') {
                    onChangeFnc(value);
                  }
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

export default DatePicker;
