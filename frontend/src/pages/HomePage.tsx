import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
// import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type Product from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Navbar } from "@/components/ui/navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Pill, PillIndicator } from "@/components/ui/pill";
import { ApiError } from "@/services/error";
import FeaturedProduct from "@/components/FeaturedProduct";
import { useCart } from "@/context/CartContext";
import { getGrossPrice } from "@/models/Product";
import { formatPriceUk } from "@/lib/utils";

const HomePage = () => {
  const navigate = useNavigate();
  const { api } = useApi();
  const { showToast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { incrementProduct } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await api.getProducts();
        setProducts(response.products);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch products"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [api]);

  const handleAddToCart = async (product: Product) => {
    try {
      await incrementProduct(product.id);
      showToast(`${product.name} added to cart!`, "success");
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.status === 401) {
          showToast(
            "You must be logged in to add items to the cart",
            "destructive"
          );
          navigate("/login");
        } else {
          showToast(err.message, "destructive");
        }
      } else {
        showToast(`Failed to add ${product.name} to cart`, "destructive");
        console.error("Error adding to cart:", err);
      }
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Spinner className="w-8 h-8 mb-4" />
            <p className="text-gray-600">Loading amazing products...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        </div>
      </>
    );
  }

  if (products.length === 0) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              No Products Found
            </h2>
            <p className="text-gray-600">
              Check back later for amazing products!
            </p>
          </div>
        </div>
      </>
    );
  }

  const [featuredProduct, ...otherProducts] = products;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-100 dark:from-slate-950 dark:to-blue-900 relative overflow-hidden">
        <GridPattern
          width={60}
          height={60}
          className="opacity-60"
          squares={[
            [4, 4],
            [5, 1],
            [8, 2],
            [5, 3],
            [5, 5],
            [10, 10],
            [12, 15],
            [15, 10],
            [10, 15],
            [15, 10],
            [10, 15],
            [15, 10],
          ]}
        />
        {/* Header */}
        <div className="relative z-10">
          <div className="container mx-auto px-4 py-12">
            <div className="text-center mb-16">
              <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-blue-700 via-blue-400 to-blue-700 dark:from-blue-200 dark:via-blue-400 dark:to-blue-200 text-transparent bg-clip-text">
                SafeKab Store
              </h1>
              <p className="text-xl text-blue-700 dark:text-blue-300 max-w-2xl mx-auto">
                Professional products and services delivered with excellence
              </p>
            </div>

            {/* Featured Product */}
            <FeaturedProduct
              featuredProduct={featuredProduct}
              formatPrice={formatPriceUk}
              handleAddToCart={handleAddToCart}
            />
            {/* Other Products */}
            {otherProducts.length > 0 && (
              <div>
                <h2 className="text-3xl font-bold text-center mb-12 text-blue-900 dark:text-blue-100">
                  Our Products
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {otherProducts.map((product) => (
                    <div
                      key={product.id}
                      className="bg-white dark:bg-slate-800 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-blue-100 dark:border-blue-800 overflow-hidden group"
                    >
                      <div className="h-48 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden">
                        <div className="absolute inset-0 bg-black/10"></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-white text-4xl font-bold opacity-30">
                            {product.name.charAt(0)}
                          </span>
                        </div>
                      </div>

                      <div className="p-6">
                        <h3 className="text-xl font-bold text-blue-900 dark:text-blue-100 mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {product.name}
                        </h3>

                        <p
                          className="text-blue-700 dark:text-blue-300 text-sm mb-4 overflow-hidden"
                          style={{
                            display: "-webkit-box",
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: "vertical",
                          }}
                        >
                          {product.description}
                        </p>

                        <div className="flex items-center justify-between mb-6">
                          <span className="text-2xl font-bold text-blue-900 dark:text-blue-100">
                            {formatPriceUk(getGrossPrice(product))}
                          </span>
                          {product.stock !== null &&
                            product.stock !== undefined && (
                              <Pill
                                variant="secondary"
                                className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700"
                              >
                                <PillIndicator
                                  variant={
                                    product.stock > 10
                                      ? "success"
                                      : product.stock > 5
                                      ? "warning"
                                      : "error"
                                  }
                                />
                                Stock: {product.stock}
                              </Pill>
                            )}
                        </div>

                        <div className="flex gap-3">
                          <Button
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-300"
                            onClick={() => handleAddToCart(product)}
                          >
                            Add to Basket
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="px-4 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/50"
                            onClick={() => navigate(`/products/${product.id}`)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Call to Action */}
            {otherProducts.length > 0 && (
              <div className="text-center mt-20">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-8 md:p-12 text-white shadow-2xl relative overflow-hidden">
                  <GridPattern
                    width={40}
                    height={40}
                    className="opacity-10"
                    squares={[
                      [2, 2],
                      [4, 6],
                      [6, 4],
                      [8, 8],
                    ]}
                  />
                  <div className="relative z-10">
                    <div className="mb-4">
                      <Pill
                        variant="secondary"
                        className="bg-white/10 text-white border-white/20"
                      >
                        <PillIndicator variant="info" pulse />
                        Shop Now
                      </Pill>
                    </div>
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                      Ready to Shop?
                    </h3>
                    <p className="text-lg md:text-xl mb-8 opacity-90 max-w-2xl mx-auto">
                      Explore our complete range of professional products and
                      services
                    </p>
                    <Button className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-3 rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-300">
                      Browse All Products
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default HomePage;
