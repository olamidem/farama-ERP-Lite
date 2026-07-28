import { useState, useMemo } from "react";
import PageHeader from "../components/ui/PageHeader";
import Button from "../components/ui/Button";
import CategoryGrid from "../features/categories/components/CategoryGrid";
import AddCategoryModal from "../features/categories/components/AddCategoryModal";
import EditCategoryModal from "../features/categories/components/EditCategoryModal";
import CategoryToolbar from "../features/categories/components/CategoryToolbar";
import DeleteCategoryModal from "../features/categories/components/DeleteCategoryModal";
import { useCategories } from "../features/categories/hooks/useCategories";
import { useProducts } from "../features/products/hooks/useProducts";
import DataTableEmpty from "../components/ui/DataTable/DataTableEmpty";
import { FolderOpen, Plus } from "lucide-react";
import { toast } from "sonner";
import type { Category } from "../features/categories/types/category";

const CategoryPage = () => {
  const [open, setOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(
    null,
  );

  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name-asc");
  const [filterBy, setFilterBy] = useState("");

  const { data: categories = [], isLoading } = useCategories();
  const { data: productsResponse } = useProducts({ page: 1, pageSize: 10000 });
  const products = useMemo(
    () => productsResponse?.data || [],
    [productsResponse],
  );

  // Compute map of category ID to count of products
  const productCountMap = useMemo(() => {
    return products.reduce<Record<string, number>>((acc, product) => {
      acc[product.category_id] = (acc[product.category_id] ?? 0) + 1;
      return acc;
    }, {});
  }, [products]);

  // Search, filter and sort categories dynamically
  const filteredAndSortedCategories = useMemo(() => {
    let result = [...categories];

    // 1. Filter by Search
    if (search.trim()) {
      const term = search.toLowerCase().trim();
      result = result.filter(
        (cat) =>
          cat.name.toLowerCase().includes(term) ||
          (cat.description && cat.description.toLowerCase().includes(term)) ||
          cat.sku_prefix.toLowerCase().includes(term),
      );
    }

    // 2. Filter by Product Association
    if (filterBy === "has-products") {
      result = result.filter((cat) => (productCountMap[cat.id] ?? 0) > 0);
    } else if (filterBy === "empty") {
      result = result.filter((cat) => (productCountMap[cat.id] ?? 0) === 0);
    }

    // 3. Sort Categories
    result.sort((a, b) => {
      if (sortBy === "name-asc") {
        return a.name.localeCompare(b.name);
      } else if (sortBy === "name-desc") {
        return b.name.localeCompare(a.name);
      } else if (sortBy === "products-desc") {
        const countA = productCountMap[a.id] ?? 0;
        const countB = productCountMap[b.id] ?? 0;
        return countB - countA;
      } else if (sortBy === "products-asc") {
        const countA = productCountMap[a.id] ?? 0;
        const countB = productCountMap[b.id] ?? 0;
        return countA - countB;
      }
      return 0;
    });

    return result;
  }, [categories, search, filterBy, sortBy, productCountMap]);

  const handleDeleteClick = (category: Category) => {
    const associatedProductsCount = productCountMap[category.id] ?? 0;
    if (associatedProductsCount > 0) {
      toast.error(
        `Cannot delete "${category.name}". It has ${associatedProductsCount} associated product(s). Please move or delete the products first.`,
      );
      return;
    }
    setDeletingCategory(category);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Manage Categories"
        description="Organize store catalogue items into custom filters."
      >
        <Button
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5"
        >
          <Plus size={16} />
          <span>Add Category</span>
        </Button>
      </PageHeader>

      {categories.length === 0 && !isLoading ? (
        <div className="overflow-hidden rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm py-12 flex flex-col items-center">
          <DataTableEmpty
            icon={FolderOpen}
            title="No Categories"
            description="Create your first category to organize products."
          />
          <Button
            onClick={() => setOpen(true)}
            className="mt-2 flex items-center gap-1.5"
          >
            <Plus size={16} />
            <span>Create First Category</span>
          </Button>
        </div>
      ) : (
        <>
          <CategoryToolbar
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortByChange={setSortBy}
            filterBy={filterBy}
            onFilterByChange={setFilterBy}
            totalCount={categories.length}
            filteredCount={filteredAndSortedCategories.length}
          />

          {isLoading ? (
            <div className="flex justify-center items-center h-48">
              <p className="text-sm font-semibold text-slate-500 animate-pulse">
                Loading categories...
              </p>
            </div>
          ) : (
            <CategoryGrid
              categories={filteredAndSortedCategories}
              products={products}
              onEdit={setEditingCategory}
              onDelete={handleDeleteClick}
            />
          )}
        </>
      )}

      {/* Add Category Modal */}
      <AddCategoryModal open={open} onClose={() => setOpen(false)} />

      {/* Edit Category Modal */}
      {editingCategory && (
        <EditCategoryModal
          open={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
        />
      )}

      {/* Delete Confirmation Dialog */}
      {deletingCategory && (
        <DeleteCategoryModal
          open={!!deletingCategory}
          onClose={() => setDeletingCategory(null)}
          category={deletingCategory}
        />
      )}
    </div>
  );
};

export default CategoryPage;
