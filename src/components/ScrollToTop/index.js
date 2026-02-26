import { useState, useEffect } from 'react'
import Fab from '@mui/material/Fab'
import Zoom from '@mui/material/Zoom'
import Tooltip from '@mui/material/Tooltip'
import { styled } from '@mui/material/styles'
import Icon from 'src/components/Icon'

const StyledFab = styled(Fab)(({ theme }) => ({
  position: 'fixed',
  bottom: theme.spacing(3),
  right: theme.spacing(3),
  zIndex: theme.zIndex.tooltip,
  boxShadow: `0 4px 20px ${theme.palette.primary.main}59`,
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: `0 8px 28px ${theme.palette.primary.main}73`
  },
  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
}))

/**
 * ScrollToTop
 * Floating button that scrolls the page to the top.
 * Appears after scrolling 200px down.
 */
const ScrollToTop = () => {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.scrollY > 200)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <Zoom in={visible} timeout={300} unmountOnExit>
      <Tooltip title='Scroll to top' placement='left'>
        <StyledFab color='primary' size='small' aria-label='Scroll to top' onClick={scrollTop}>
          <Icon icon='tabler:arrow-up' fontSize={20} />
        </StyledFab>
      </Tooltip>
    </Zoom>
  )
}

export default ScrollToTop
