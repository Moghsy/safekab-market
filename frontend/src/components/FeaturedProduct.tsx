import { Pill, PillIndicator } from "@/components/ui/pill";
import type Product from "@/models/Product";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { getGrossPrice } from "@/models/Product";

type props = {
  featuredProduct: Product;
  formatPrice: (priceInPence: number) => string;
  handleAddToCart: (product: Product) => Promise<void>;
};
export default function FeaturedProduct({
  featuredProduct,
  formatPrice,
  handleAddToCart,
}: props) {
  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold text-center mb-8 text-blue-900 dark:text-blue-100">
        Featured Product
      </h2>
      <div className="max-w-4xl mx-auto">
        <div className="bg-gray-200 dark:bg-slate-800/90 rounded-2xl shadow-2xl border border-gray-300 dark:border-blue-700 overflow-hidden">
          <div className="md:flex">
            <div className="md:w-1/2 p-8 md:p-12">
              <div className="mb-4">
                <Pill
                  variant="secondary"
                  className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-700"
                >
                  <PillIndicator variant="info" pulse />
                  Featured
                </Pill>
              </div>
              <h3 className="text-3xl md:text-4xl font-bold text-blue-900 dark:text-blue-100 mb-4">
                {featuredProduct.name}
              </h3>
              <p className="text-blue-700 dark:text-blue-300 text-lg mb-6 leading-relaxed">
                {featuredProduct.description}
              </p>
              <div className="flex items-center justify-between mb-8">
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  {formatPrice(getGrossPrice(featuredProduct))}
                </div>
                {featuredProduct.stock !== null &&
                  featuredProduct.stock !== undefined && (
                    <Pill
                      variant="secondary"
                      className="bg-blue-50 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-700"
                    >
                      <PillIndicator
                        variant={
                          featuredProduct.stock > 10
                            ? "success"
                            : featuredProduct.stock > 5
                            ? "warning"
                            : "error"
                        }
                      />
                      Stock: {featuredProduct.stock}
                    </Pill>
                  )}
              </div>
              <div className="flex gap-4">
                <Button
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
                  onClick={() => handleAddToCart(featuredProduct)}
                >
                  Add to Basket
                </Button>
                <Link to={`/products/${featuredProduct.id}`}>
                  <Button
                    variant="outline"
                    className="px-6 py-3 border-blue-300 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/50"
                  >
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 relative">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="h-64 md:h-full flex items-center justify-center">
                <div className="text-white text-8xl font-bold ">
                  <img
                    // src={SafekabPicture}
                    src={
                      featuredProduct.images &&
                      featuredProduct.images.length > 0
                        ? featuredProduct.images[0].image_url
                        : undefined
                    }
                    alt="Safekab Button"
                    className="text-center"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
