'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import CategoryForm, { CategoryData } from '@/components/CategoryForm';
import CategoryList from '@/components/CategoryList';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, X, Loader2, Search, FolderTree, Layers } from "lucide-react";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function CategoriesPage() {
  // Auth
  const { isLoading: isAuthLoading, isAuthenticated, isAdmin } = useAuth();

  // Data
  const [categories, setCategories] = useState<CategoryData[]>([]);

  // UI states
  const [loading, setLoading] = useState<boolean>(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editCategory, setEditCategory] = useState<CategoryData | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterMainCategory, setFilterMainCategory] = useState<string>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');

  // Check if filters are active
  const hasActiveFilters = filterName || filterMainCategory !== 'all' || filterSubCategory !== 'all';

  // Derived lists
  const mainCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);
  const subCategoriesForSelectedMain = useMemo(() => {
    if (filterMainCategory === 'all') return [];
    return categories.filter(c => c.parentId === filterMainCategory);
  }, [categories, filterMainCategory]);

  // Fetch
  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/categories');
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories || []);
      } else {
        console.error('Failed to fetch categories', res.status);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCategories();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Filtered result
  const filteredCategories = useMemo(() => {
    return categories.filter(cat => {
      // name
      if (filterName && !cat.name.toLowerCase().includes(filterName.toLowerCase())) return false;

      // main category stage: show selected main category and its children
      if (filterMainCategory !== 'all') {
        if (!cat.parentId) {
          // main category
          if (cat._id !== filterMainCategory) return false;
        } else {
          // sub category
          if (cat.parentId !== filterMainCategory) return false;
        }
      }

      // sub category exact match
      if (filterSubCategory !== 'all' && cat._id !== filterSubCategory) return false;

      return true;
    });
  }, [categories, filterName, filterMainCategory, filterSubCategory]);

  const resetFilters = () => {
    setFilterName('');
    setFilterMainCategory('all');
    setFilterSubCategory('all');
  };

  // CRUD handlers
  const handleCategorySubmit = async (categoryData: CategoryData) => {
    if (!isAdmin) {
      alert('You do not have permission to perform this action.');
      return;
    }

    try {
      const isEdit = Boolean(categoryData._id);
      const url = isEdit ? `/api/categories/${categoryData._id}` : '/api/categories';
      const method = isEdit ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(categoryData),
      });

      if (res.ok) {
        await fetchCategories();
        setIsSheetOpen(false);
        setEditCategory(null);
      } else {
        const text = await res.text();
        console.error('Save failed', text);
        alert('Operation failed due to server or permission error.');
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred.');
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (!isAdmin) {
      alert('You do not have permission to perform this action.');
      return;
    }
    if (!confirm('Are you sure you want to delete this category? This will also delete its sub-categories.')) return;

    try {
      const res = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchCategories();
      } else {
        console.error('Delete failed', res.status);
        alert('Deletion failed due to server or permission error.');
      }
    } catch (err) {
      console.error(err);
      alert('Unexpected error occurred.');
    }
  };

  const openEditSheet = (category: CategoryData) => {
    if (!isAdmin) {
      alert('You must be an Admin to edit categories.');
      return;
    }
    setEditCategory(category);
    setIsSheetOpen(true);
  };

  // Auth UI states
  if (isAuthLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600 font-medium">Authenticating...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto mt-16 px-4">
        <Card className="border-l-4 border-l-amber-500 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-900">Authentication Required</CardTitle>
            <p className="text-slate-600 text-sm">
              Access to Category Management requires authentication.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-5 border border-amber-100">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-amber-600 rounded-full"></span>
                Access Level
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-amber-700">C</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Client Role</p>
                    <p className="text-slate-600">Clients are typically restricted from category management</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-700">A</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Admin Role</p>
                    <p className="text-slate-600">Full access to add, edit, and delete categories and sub-categories</p>
                  </div>
                </div>
              </div>
            </div>
            <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium" size="lg">
              Sign In to Continue
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main layout
  return (
    <div className="space-y-5 fade-in pb-8">
      
      {/* ENHANCED HEADER */}
      <div className="bg-gradient-to-r from-slate-50 to-indigo-50 -mx-6 -mt-6 px-6 py-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Category Management</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${
                isAdmin 
                  ? 'bg-indigo-100 text-indigo-700 border border-indigo-200' 
                  : 'bg-amber-100 text-amber-700 border border-amber-200'
              }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {isAdmin ? 'Administrator' : 'Client'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                {isAdmin ? 'Full category management access' : 'Access restricted'}
              </span>
            </div>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-medium"
                size="lg"
                onClick={() => { setEditCategory(null); setIsSheetOpen(true); }}
                disabled={!isAdmin}
              >
                <Plus className="mr-2 h-4 w-4" /> New Category
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="sm:max-w-md w-full md:w-[520px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-xl">
                  {editCategory ? 'Edit Category' : 'Create New Category'}
                </SheetTitle>
                <SheetDescription className="text-sm text-slate-500">
                  Define the category name and its parent, if applicable.
                </SheetDescription>
              </SheetHeader>

              <div className="mt-4">
                <CategoryForm
                  onSubmit={handleCategorySubmit}
                  initialValues={editCategory || undefined}
                  categories={categories}
                  buttonText={editCategory ? 'Save Changes' : 'Create Category'}
                  onCancel={() => setIsSheetOpen(false)}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ENHANCED FILTER BAR */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center">
                <Filter className="h-4 w-4 text-indigo-700" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Filter & Search</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {hasActiveFilters ? `${[filterName, filterMainCategory !== 'all', filterSubCategory !== 'all'].filter(Boolean).length} active filter(s)` : 'No filters applied'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={resetFilters} 
                  className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-3 font-medium"
                >
                  <X className="h-3.5 w-3.5 mr-1.5" /> Clear All
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="h-8 px-3 text-slate-600"
              >
                {showFilters ? 'Hide' : 'Show'}
              </Button>
            </div>
          </div>
        </CardHeader>

        {showFilters && (
          <CardContent className="pt-5 pb-5">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Search Input */}
              <div className="space-y-2 md:col-span-1">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Search</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    value={filterName}
                    onChange={(e) => setFilterName(e.target.value)}
                    placeholder="Search categories..."
                    className="h-10 pl-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500"
                  />
                  {filterName && (
                    <button
                      onClick={() => setFilterName("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Main Category */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Main Category</Label>
                <Select
                  value={filterMainCategory}
                  onValueChange={(val) => { setFilterMainCategory(val); setFilterSubCategory('all'); }}
                >
                  <SelectTrigger className="h-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500">
                    <SelectValue placeholder="All Main Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Main Categories</SelectItem>
                    {mainCategories.filter(mc => mc._id).map((mc) => (
                      <SelectItem key={mc._id} value={mc._id!}>{mc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Category */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Sub-Category</Label>
                <Select
                  disabled={filterMainCategory === 'all'}
                  value={filterSubCategory}
                  onValueChange={setFilterSubCategory}
                >
                  <SelectTrigger className="h-10 border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 disabled:opacity-50">
                    <SelectValue placeholder={filterMainCategory === 'all' ? 'Select main first' : 'All Sub-Categories'} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Sub-Categories</SelectItem>
                    {subCategoriesForSelectedMain.filter(sc => sc._id).map((sc) => (
                      <SelectItem key={sc._id} value={sc._id!}>{sc.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* ENHANCED RESULTS CARD */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                <FolderTree className="h-4 w-4 text-slate-700" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  {loading ? 'Loading...' : `${categories.length} Total Categories`}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {loading ? 'Please wait' : `Showing ${filteredCategories.length} categor${filteredCategories.length === 1 ? 'y' : 'ies'}`}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
                <Layers className="h-3.5 w-3.5" />
                <span>
                  <span className="font-medium text-slate-700">{mainCategories.length}</span> Main
                </span>
                <span className="text-slate-300">•</span>
                <span>
                  <span className="font-medium text-slate-700">{categories.length - mainCategories.length}</span> Sub
                </span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
              <p className="text-sm text-slate-600 font-medium">Loading categories...</p>
            </div>
          ) : filteredCategories.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <FolderTree className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Categories Found</h3>
              <p className="text-sm text-slate-600 max-w-md mb-4">
                {hasActiveFilters 
                  ? 'No categories match your current filter criteria. Try adjusting your filters.' 
                  : 'There are no categories yet. Start by creating your first category.'}
              </p>
              {hasActiveFilters && (
                <Button onClick={resetFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <CategoryList
              categories={filteredCategories}
              onEdit={openEditSheet}
              onDelete={handleDeleteCategory}
              allCategories={categories}
            />
          )}
        </CardContent>
      </Card>

      {/* HELPFUL TIP */}
      <div className="flex items-start gap-2 text-sm text-slate-500 bg-blue-50 border border-blue-100 rounded-lg p-3">
        <div className="w-1 h-1 rounded-full bg-blue-400 mt-2"></div>
        <p>
          <span className="font-medium text-slate-700">Tip:</span> Use the filter bar to quickly narrow down categories. Selecting a main category will enable its sub-category filter.
        </p>
      </div>
    </div>
  );
}