import React from "react";
import { Button } from "@/components/ui/button";
import { Table } from "@/components/ui/table";
import type { ColumnDef } from "@/components/ui/table";
import { formatPriceUk } from "@/lib/utils";
import type Product from "@/models/Product";
import { ProductFormDialog } from "./ProductFormDialog";

interface ProductsTabProps {
  products: Product[];
  onRefresh: () => void;
}

export const ProductsTab: React.FC<ProductsTabProps> = ({
  products,
  onRefresh,
}) => {
  const [showProductDialog, setShowProductDialog] = React.useState(false);
  const [editProduct, setEditProduct] = React.useState<Product | null>(null);

  const productColumns: ColumnDef<Product>[] = [
    { accessorKey: "id", header: "ID" },
    { accessorKey: "name", header: "Name" },
    {
      accessorKey: "net_price",
      header: "Net Price",
      cell: ({ row }: { row: any }) => formatPriceUk(row.net_price),
    },
    { accessorKey: "vat_rate", header: "VAT %" },
    { accessorKey: "currency", header: "Currency" },
    {
      accessorKey: "stock",
      header: "Stock",
      cell: ({ row }: { row: any }) => {
        if (row.original === undefined) return "-";
        const stock = row.original.stock;
        return stock !== null && stock !== undefined ? stock : "—";
      },
    },
    { accessorKey: "description", header: "Description" },
    {
      accessorKey: "actions",
      header: "Actions",
      cell: ({ row }: { row: any }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setEditProduct(row);
            setShowProductDialog(true);
          }}
        >
          Edit
        </Button>
      ),
    },
  ];

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button
          onClick={() => {
            setEditProduct(null);
            setShowProductDialog(true);
          }}
        >
          Add Product
        </Button>
      </div>

      <ProductFormDialog
        open={showProductDialog}
        onOpenChange={setShowProductDialog}
        editProduct={editProduct}
        onSuccess={onRefresh}
      />

      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <Table columns={productColumns} data={products} />
      </div>
    </>
  );
};
