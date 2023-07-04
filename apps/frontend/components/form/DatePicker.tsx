import React from 'react';
import { Field } from 'formik';
import FormControl from '@mui/material/FormControl';
import { DatePicker as MuiDatePickerComponent } from '@mui/x-date-pickers/DatePicker';

type DatePickerProps = {
  label?: string;
  name: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
  helperText?: string;
  disabled?: boolean;
  textFieldProps?: any;
  helperTextColor?: string;
  multiline?: boolean;
  rows?: number;
  inputBackground?: string;
};

export const DatePicker = ({
  label,
  name,
  startAdornment,
  endAdornment,
  helperText,
  disabled = false,
  textFieldProps = {},
  helperTextColor = '#888888',
  inputBackground = 'white',
}: DatePickerProps) => {
  return (
    <Field autoComplete="nope" name={name}>
      {({ field, meta, form }) => (
        <FormControl
          size="small"
          sx={{ width: '100%', mb: 1 }}
          error={!!meta.touched && !!meta.error}
        >
          <MuiDatePickerComponent
            slotProps={{ textField: { size: 'small', ...textFieldProps } }}
            disableFuture={true}
            showTodayButton={false}
            disabled={disabled}
            label={label}
            views={['year', 'month', 'day']}
            variant="filled"
            size="small"
            allowSameDateSelection={true}
            {...field}
            value={field.value || null}
            InputProps={{
              startAdornment: startAdornment,
            }}
          />
        </FormControl>
      )}
    </Field>
  );
};

export default DatePicker;
