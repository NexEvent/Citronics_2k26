import { useRouter } from 'next/router'
import Button from '@mui/material/Button'
import { useAppPalette } from 'src/components/palette'
import Icon from 'src/components/Icon'

/**
 * BackButton — Reusable back navigation button.
 *
 * Props:
 *  href    {string}   Where to navigate (uses router.push). Defaults to '/'.
 *  label   {string}   Button text. Defaults to 'Back'.
 *  onBeforeNavigate {function} Optional cleanup to run before navigating.
 *  sx      {object}   Extra MUI sx overrides.
 */
export default function BackButton({ href = '/', label = 'Back', onBeforeNavigate, sx = {} }) {
  const router = useRouter()
  const c = useAppPalette()

  const handleClick = () => {
    if (onBeforeNavigate) onBeforeNavigate()
    router.push(href)
  }

  return (
    <Button
      onClick={handleClick}
      startIcon={<Icon icon='tabler:arrow-left' fontSize={15} />}
      sx={{
        color: c.textSecondary,
        fontWeight: 600,
        fontSize: '0.8rem',
        textTransform: 'none',
        p: 0,
        minWidth: 0,
        '&:hover': { color: c.primary, bgcolor: 'transparent' },
        ...sx
      }}
    >
      {label}
    </Button>
  )
}
