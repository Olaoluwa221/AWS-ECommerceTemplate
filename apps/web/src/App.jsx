import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import BackToTop from './components/BackToTop'
import PageTransition from './components/PageTransition'
import { ProtectedRoute, AdminRoute, GuestOnlyRoute } from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Register from './pages/Register'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminProducts from './pages/admin/AdminProducts'
import AdminOrders from './pages/admin/AdminOrders'
import AdminEmails from './pages/admin/AdminEmails'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import UploadArtwork from './pages/UploadArtwork'
import Unsubscribe from './pages/Unsubscribe'
import AdminUsers from './pages/admin/AdminUsers'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <PageTransition>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<GuestOnlyRoute><Login /></GuestOnlyRoute>} />
          <Route path="/register" element={<GuestOnlyRoute><Register /></GuestOnlyRoute>} />
          <Route path="/products" element={<Products />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin/emails" element={<AdminRoute><AdminEmails /></AdminRoute>} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/upload-artwork/:token" element={<UploadArtwork />} />
          <Route path="/unsubscribe/:token" element={<Unsubscribe />} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/profile" element={
            <ProtectedRoute><Profile /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <AdminRoute><AdminDashboard /></AdminRoute>
          } />
          <Route path="/admin/products" element={
            <AdminRoute><AdminProducts /></AdminRoute>
          } />
          <Route path="/admin/orders" element={
            <AdminRoute><AdminOrders /></AdminRoute>
          } />
        </Routes>
      </PageTransition>
      <BackToTop />
    </BrowserRouter>
  )
}

export default App