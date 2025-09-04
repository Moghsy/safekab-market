import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useApi } from "@/hooks/useApi";
import { useCart } from "@/context/CartContext";
import { useToast } from "@/context/ToastContext";
import type Product from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Navbar } from "@/components/ui/navbar";
import { GridPattern } from "@/components/ui/grid-pattern";
import { Pill, PillIndicator } from "@/components/ui/pill";
import {
  Carousel,
  Card,
  type Card as CardType,
} from "@/components/ui/apple-cards-carousel";
import { ApiError } from "@/services/error";
import { getGrossPrice } from "@/models/Product";
import { formatPriceUk } from "@/lib/utils";

const ProductDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { api } = useApi();
  const { showToast } = useToast();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { incrementProduct } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id || isNaN(Number(id))) {
        setError("Invalid product ID");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const productData = await api.getProduct(Number(id));
        setProduct(productData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch product"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProduct();
  }, [api, id]);

  // Create carousel cards from product images and videos
  const createImageCards = (product: Product): CardType[] => {
    const media =
      product.images && product.images.length > 0 ? product.images : [];

    if (media.length === 0) {
      // Create a fallback card if no media
      return [
        {
          src: "",
          title: product.name,
          category: "Product Media",
          content: (
            <div className="h-96 bg-gradient-to-br from-blue-400 to-blue-600 relative overflow-hidden rounded-lg">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-white text-8xl font-bold opacity-30">
                  {product.name.charAt(0)}
                </span>
              </div>
            </div>
          ),
        },
      ];
    }

    return media.map((item, index) => {
      if (item.media_type === "video") {
        return {
          src: item.image_url,
          title: `${product.name} - Video ${index + 1}`,
          category: "Product Video",
          content: (
            <div className="h-96 relative overflow-hidden rounded-lg flex items-center justify-center bg-black">
              <video
                src={item.image_url}
                controls
                className="w-full h-full object-contain bg-black rounded-lg"
                poster={item.alt_text}
              >
                Sorry, your browser doesn't support embedded videos.
              </video>
            </div>
          ),
        };
      } else {
        return {
          src: item.image_url,
          title: `${product.name} - Image ${index + 1}`,
          category: "Product Image",
          content: (
            <div className="h-96 relative overflow-hidden rounded-lg">
              <img
                src={item.image_url}
                alt={item.alt_text || `${product.name} - Image ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </div>
          ),
        };
      }
    });
  };

  const handleAddToCart = async () => {
    if (!product) return;

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

  const handleGoBack = () => {
    navigate(-1);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Spinner className="w-8 h-8 mb-4" />
            <p className="text-gray-600">Loading product details...</p>
          </div>
        </div>
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <p className="text-red-600 mb-4">
              Error: {error || "Product not found"}
            </p>
            <div className="space-x-4">
              <Button onClick={handleGoBack}>Go Back</Button>
              <Button onClick={() => navigate("/")}>Go Home</Button>
            </div>
          </div>
        </div>
      </>
    );
  }

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

        <div className="relative z-10">
          <div className="container mx-auto px-4 py-12">
            {/* Back Button */}
            <div className="mb-8">
              <Button
                variant="outline"
                onClick={handleGoBack}
                className="border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/50"
              >
                ← Back to Products
              </Button>
            </div>

            {/* Product Details */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-blue-100 dark:border-blue-800">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                {/* Product Images Carousel */}
                <div className="h-96 lg:h-full bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <Carousel
                      items={createImageCards(product).map((card, index) => (
                        <Card key={index} card={card} index={index} />
                      ))}
                    />
                  ) : (
                    <>
                      <div className="absolute inset-0 bg-black/10"></div>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-white text-8xl font-bold opacity-30">
                          {product.name.charAt(0)}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* Product Information */}
                <div className="p-8 lg:p-12">
                  <div className="mb-6">
                    <h1 className="text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                      {product.name}
                    </h1>

                    <div className="flex items-center justify-between mb-6">
                      <span className="text-3xl font-bold text-blue-900 dark:text-blue-100">
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
                  </div>

                  <div className="mb-8">
                    <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      Description
                    </h2>
                    <p className="text-blue-700 dark:text-blue-300 text-lg leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Product Details */}
                  <div className="mb-8 space-y-3">
                    <h2 className="text-xl font-semibold text-blue-900 dark:text-blue-100 mb-3">
                      Product Details
                    </h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          Price:
                        </span>
                        <span className="block text-blue-700 dark:text-blue-300">
                          {formatPriceUk(getGrossPrice(product))}
                        </span>
                      </div>
                      <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                        <span className="font-medium text-blue-900 dark:text-blue-100">
                          Product ID:
                        </span>
                        <span className="block text-blue-700 dark:text-blue-300">
                          #{product.id}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Add to Cart Button */}
                  <div className="space-y-4">
                    <Button
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300"
                      onClick={handleAddToCart}
                      disabled={product.stock === 0}
                    >
                      {product.stock === 0 ? "Out of Stock" : "Add to Basket"}
                    </Button>

                    <Button
                      variant="outline"
                      size="lg"
                      className="w-full border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/50 py-4 rounded-xl font-medium"
                      onClick={() => navigate("/cart")}
                    >
                      View Basket
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetailsPage;
