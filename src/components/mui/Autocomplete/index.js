import { forwardRef } from 'react'
import Paper from '@mui/material/Paper'
import MuiAutocomplete from '@mui/material/Autocomplete'
import { styled } from '@mui/material/styles'
import CustomTextField from 'src/components/mui/TextField'

/**
 * CustomAutocomplete
 *
 * Wraps MUI Autocomplete with:
 *  - A styled dropdown Paper that matches the design system
 *  - CustomTextField as the default renderInput (pass `renderInput` to override)
 *  - All standard Autocomplete props pass through
 *
 * @example
 * <CustomAutocomplete
 *   options={venues}
 *   getOptionLabel={v => v.name}
 *   label='Venue'
 *   placeholder='Select a venue'
 * />
 */
const StyledPaper = styled(Paper)(({ theme }) => ({
  boxShadow:    theme.shadows[6],
  borderRadius: 10,
  marginTop:    theme.spacing(0.5),
  '& .MuiAutocomplete-listbox': {
    padding: theme.spacing(0.5, 0),
    '& .MuiAutocomplete-option': {
      fontSize:  theme.typography.body2.fontSize,
      padding:   theme.spacing(1.25, 2),
      '&[aria-selected="true"]': {
        backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.06)`
      },
      '&.Mui-focused, &:hover': {
        backgroundColor: `rgba(${theme.palette.customColors.mainRgb}, 0.04)`
      }
    }
  },
  '& .MuiAutocomplete-noOptions, & .MuiAutocomplete-loading': {
    fontSize: theme.typography.body2.fontSize,
    color:    theme.palette.text.secondary,
    padding:  theme.spacing(2)
  }
}))

const CustomAutocomplete = forwardRef((props, ref) => {
  const {
    label,
    placeholder,
    helperText,
    error,
    required,
    renderInput,
    ...rest
  } = props

  const defaultRenderInput = (params) => (
    <CustomTextField
      {...params}
      label={label}
      placeholder={placeholder}
      helperText={helperText}
      error={error}
      required={required}
    />
  )

  return (
    <MuiAutocomplete
      ref={ref}
      PaperComponent={StyledPaper}
      renderInput={renderInput ?? defaultRenderInput}
      {...rest}
    />
  )
})

CustomAutocomplete.displayName = 'CustomAutocomplete'

export default CustomAutocomplete
