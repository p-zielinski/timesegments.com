import React from 'react';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import { TextField as DefaultTextField } from '@mui/material';
import helperTextHandler from '../../helperFunctions/helperTextHandler';
import { StyledComponent } from 'styled-components';
import { FastField } from 'formik';

type SelectWithSearchProps = {
  label?: string;
  name: string;
  options: { value: number | string; label: string }[];
  groupBy?: (option) => string;
  helperText?: string;
  disabled?: boolean;
  TextField?: StyledComponent<any>;
  helperTextColor?: string;
  inputBackground?: string;
  startAdornment?: React.ReactNode;
  endAdornment?: React.ReactNode;
};

export type AutocompleteCloseReason =
  | 'createOption'
  | 'toggleInput'
  | 'escape'
  | 'selectOption'
  | 'removeOption'
  | 'blur';

export const SelectWithSearch: React.FC<SelectWithSearchProps> = ({
  label,
  name,
  options,
  helperText,
  groupBy,
  disabled = false,
  TextField = DefaultTextField,
  helperTextColor = '#888888',
  inputBackground = 'white',
  startAdornment,
  endAdornment,
}) => {
  return (
    <FastField autoComplete="nope" name={name}>
      {({ field, meta, form }) => {
        return (
          <>
            <FormControl
              sx={{ width: '100%', mb: 2 }}
              error={!!meta.touched && !!meta.error}
            >
              <Autocomplete
                disablePortal
                disableClearable
                sx={{ mb: -1 }}
                groupBy={groupBy}
                options={options}
                defaultValue={field.value}
                // @ts-ignore
                onChange={(e, valueObj: { value: string; label: string }) => {
                  form.setFieldValue(name, valueObj?.value || '');
                  form.setFieldError(name, undefined);
                }}
                onClose={(event, reason: AutocompleteCloseReason) => {
                  if (reason !== 'selectOption') {
                    form.setFieldTouched(name, true);
                  }
                }}
                // @ts-ignore
                value={options.find((o) => o.value === field.value) || null}
                renderInput={(params) => (
                  <TextField
                    disabled={disabled}
                    {...params}
                    size="small"
                    autoComplete="nope"
                    helperText={helperTextHandler(meta, helperText)}
                    focused={
                      !!(
                        meta.initialValue !== meta.value &&
                        meta.value &&
                        !meta.error
                      )
                    }
                    FormHelperTextProps={{
                      sx: {
                        mt: helperText?.match(/optional/i) ? 0 : '-3px',
                        ml: '4px',
                        mb: -2,
                        color: helperTextColor,
                      },
                    }}
                    InputLabelProps={{
                      sx: {
                        background: 'rgba(255,255,255,.5)',
                        borderRadius: '7px',
                      },
                    }}
                    sx={{ mb: 1, background: 'white', borderRadius: '7px' }}
                    error={!!(meta.touched && meta.error)}
                    name={name}
                    id={`select-${label}`}
                    variant="outlined"
                    label={label}
                  />
                )}
              />
            </FormControl>
          </>
        );
      }}
    </FastField>
  );
};
