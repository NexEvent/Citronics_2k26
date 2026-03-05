import Box from '@mui/material/Box'
import PublicNavbar from 'src/views/home/PublicNavbar'
import PublicFooter from 'src/views/home/PublicFooter'
import GalleryView from 'src/views/gallery/GalleryView'

export default function GalleryPage() {
  return (
    <Box sx={{ overflowX: 'hidden', pb: { xs: 'calc(64px + env(safe-area-inset-bottom, 0px))', md: 0 } }}>
      <PublicNavbar />
      <GalleryView />
      <PublicFooter />
    </Box>
  )
}

GalleryPage.authGuard = false
GalleryPage.guestGuard = false
GalleryPage.getLayout = page => page
