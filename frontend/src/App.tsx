import ErrorElement from "./components/ui/error-element";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { Suspense, lazy } from "react";
import Loading from "./pages/Loading";
import Root from "./pages/Root";

const HomePage = lazy(() => import("./pages/HomePage"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const SignUpPage = lazy(() => import("./pages/SignUpPage"));
const CartPage = lazy(() => import("./pages/CartPage"));
const ProductDetailsPage = lazy(() => import("./pages/ProductDetailsPage"));
const ProtectedRoute = lazy(() => import("./pages/ProtectedRoute"));
const OrdersPage = lazy(() => import("./pages/OrdersPage"));
const AdminRoute = lazy(() => import("./pages/AdminRoute"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const CheckoutResult = lazy(() => import("./pages/CheckoutResult"));

function App() {
  return (
    <Router>
      <Suspense fallback={<Loading />}>
        <Routes>
          <Route path="/" element={<Root />} errorElement={<ErrorElement />}>
            <Route index element={<HomePage />} />
            <Route path="products/:id" element={<ProductDetailsPage />} />
            <Route path="login" element={<LoginPage />} />
            <Route path="signup" element={<SignUpPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="dashboard" element={<></>} />
              <Route path="cart" element={<CartPage />} />
              <Route path="orders" element={<OrdersPage />} />
              <Route
                path="checkout/:result/:orderId"
                element={<CheckoutResult />}
              />
            </Route>
            <Route element={<AdminRoute />} path="admin">
              <Route path="dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
