import { forwardRef } from 'react'
import TextField from '@mui/material/TextField'
import { styled } from '@mui/material/styles'

/**
 * CustomTextField
 *
 * A styled MUI TextField that puts the label ABOVE the input (not floating
 * inside it) and adds consistent border/focus styles matching the Citronics
 * design system.
 *
 * Drop-in replacement for `<TextField>` — accepts all the same props.
 *
 * @example
 * <CustomTextField fullWidth label='Event Title' placeholder='Enter title' />
 * <CustomTextField fullWidth select label='Status'>...</CustomTextField>
 * <CustomTextField multiline minRows={3} label='Description' />
 */
const TextFieldStyled = styled(TextField)(({ theme }) => ({
  // ── Label: sits above the box, never floats ─────────────────────────────
  '& .MuiInputLabel-root': {
    transform:     'none',
    lineHeight:    1.154,
    position:      'relative',
    marginBottom:  theme.spacing(1),
    fontSize:      theme.typography.body2.fontSize,
    color:         `${theme.palette.text.primary} !important`,
    '&.Mui-error': { color: `${theme.palette.error.main} !important` }
  },

  // ── Input box ────────────────────────────────────────────────────────────
  '& .MuiInputBase-root': {
    borderRadius: 8,
    backgroundColor: 'transparent !important',
    border: `1px solid rgba(${theme.palette.customColors.mainRgb}, 0.22)`,
    transition: theme.transitions.create(['border-color', 'box-shadow'], {
      duration: theme.transitions.duration.shorter
    }),
    '&:not(.Mui-focused):not(.Mui-disabled):not(.Mui-error):hover': {
      borderColor: `rgba(${theme.palette.customColors.mainRgb}, 0.32)`
    },
    // remove the built-in underline lines
    '&:before, &:after': { display: 'none' },
    '&.MuiInputBase-sizeSmall': { borderRadius: 6 },
    '&.Mui-error':   { borderColor: theme.palette.error.main },
    '&.Mui-disabled': {
      opacity: 0.6,
      borderColor: `rgba(${theme.palette.customColors.mainRgb}, 0.12)`
    },
    // focused: colored border + subtle shadow
    '&.Mui-focused': {
      boxShadow: `0 0 0 3px rgba(${theme.palette.customColors.mainRgb}, 0.08)`,
      '& .MuiInputBase-input:not(.MuiInputBase-readOnly):not([readonly])::placeholder': {
        transform: 'translateX(4px)'
      },
      '&.MuiInputBase-colorPrimary':   { borderColor: theme.palette.primary.main },
      '&.MuiInputBase-colorSecondary': { borderColor: theme.palette.secondary.main },
      '&.MuiInputBase-colorInfo':      { borderColor: theme.palette.info.main },
      '&.MuiInputBase-colorSuccess':   { borderColor: theme.palette.success.main },
      '&.MuiInputBase-colorWarning':   { borderColor: theme.palette.warning.main },
      '&.MuiInputBase-colorError':     { borderColor: theme.palette.error.main },
      '&.Mui-error':                   { borderColor: theme.palette.error.main }
    }
  },

  // ── Inner input ──────────────────────────────────────────────────────────
  '& .MuiInputBase-input': {
    color: theme.palette.text.primary,
    '&:not(textarea)': { padding: '10px 14px' },
    '&:not(textarea).MuiInputBase-inputSizeSmall': { padding: '7px 10px' },
    '&::placeholder': {
      color: theme.palette.text.disabled,
      transition: theme.transitions.create(['opacity', 'transform'], {
        duration: theme.transitions.duration.shorter
      })
    },
    // adornment spacing
    '&.MuiInputBase-inputAdornedStart:not(.MuiAutocomplete-input)': { paddingLeft: 0 },
    '&.MuiInputBase-inputAdornedEnd:not(.MuiAutocomplete-input)':   { paddingRight: 0 }
  },

  // ── Helper / error text ──────────────────────────────────────────────────
  '& .MuiFormHelperText-root': {
    margin: theme.spacing(0.75, 0, 0),
    fontSize: theme.typography.caption.fontSize,
    color: theme.palette.text.secondary,
    '&.Mui-error': { color: theme.palette.error.main }
  },

  // ── Select ───────────────────────────────────────────────────────────────
  '& .MuiSelect-select:focus, & .MuiNativeSelect-select:focus': {
    backgroundColor: 'transparent'
  },

  // ── Autocomplete inner padding ───────────────────────────────────────────
  '& .MuiAutocomplete-input': {
    paddingLeft:   '6px  !important',
    paddingTop:    '7px  !important',
    paddingBottom: '7px  !important'
  }
}))

const CustomTextField = forwardRef((props, ref) => (
  <TextFieldStyled ref={ref} size='medium' variant='filled' {...props} />
))

CustomTextField.displayName = 'CustomTextField'

export default CustomTextField
