import React from 'react';
import { FastField } from 'formik';
import FormControl from '@mui/material/FormControl';
import Autocomplete from '@mui/material/Autocomplete';
import TextField from '@mui/material/TextField';
import helperTextHandler from '../../helperFunctions/helperTextHandler';

type SelectWithSearchProps = {
  label?: string;
  name: string;
  options: { value: number | string; label: string }[];
  groupBy?: (option) => string;
  helperText?: string;
};

export const SelectWithSearch: React.FC<SelectWithSearchProps> = ({
  label,
  name,
  options,
  helperText,
  groupBy,
}) => {
  return (
    <FastField autoComplete="nope" name={name}>
      {({ field, meta, form }) => (
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
            }}
            // @ts-ignore
            value={options.find((o) => o.value === field.value) || null}
            renderInput={(params) => (
              <TextField
                {...params}
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
                    mb: helperText?.match(/optional/i) ? -0.5 : -1,
                  },
                }}
                sx={{ mb: 0 }}
                error={!!(meta.touched && meta.error)}
                name={name}
                id={`select-${label}`}
                variant="outlined"
                label={label}
              />
            )}
          />
        </FormControl>
      )}
    </FastField>
  );
};
