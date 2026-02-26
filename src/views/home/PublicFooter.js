import Footer from 'src/components/footer'

/**
 * PublicFooter — View-level wrapper
 *
 * Delegates rendering to the reusable Footer component
 * (src/components/footer). Keeps the view layer thin,
 * following the project's architecture conventions.
 */
export default function PublicFooter() {
  return <Footer />
}
