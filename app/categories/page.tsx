'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import CategoryForm, { CategoryData } from '@/components/CategoryForm';
import CategoryList from '@/components/CategoryList';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, X, Loader2, Edit2, Trash2 } from "lucide-react";

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

  // Filters
  const [filterName, setFilterName] = useState('');
  const [filterMainCategory, setFilterMainCategory] = useState<string>('all');
  const [filterSubCategory, setFilterSubCategory] = useState<string>('all');

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
      <div className="flex justify-center items-center h-[50vh] text-slate-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading Authentication...
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto mt-12 px-4">
        <div className="rounded-lg bg-white shadow-sm border border-slate-100 p-6">
          <h2 className="text-lg font-semibold text-slate-900">Access Denied</h2>
          <p className="mt-2 text-sm text-slate-600">You must be signed in to view Category Management.</p>

          <div className="mt-4 bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800 rounded">
            <p className="font-medium">Client Role:</p>
            <p>Clients are typically restricted from viewing this management page.</p>
            <p className="font-medium mt-2">Admin Role:</p>
            <p>Admins have full control over categories (Add, Edit, Delete).</p>
          </div>
        </div>
      </div>
    );
  }

  // Main layout
  return (
    <div className="w-100 mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold leading-tight text-slate-900">Category Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            {isAdmin ? 'Admin: Full control over categories.' : 'Access restricted to Administrators.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                className="shadow-sm"
                onClick={() => { setEditCategory(null); setIsSheetOpen(true); }}
                disabled={!isAdmin}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Category
              </Button>
            </SheetTrigger>

            <SheetContent side="right" className="sm:max-w-md w-full md:w-[520px]">
              <SheetHeader>
                <SheetTitle className="text-lg font-medium">
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

      {/* Toolbar / Filters (Option B style: soft background, subtle border) */}
      <div className="bg-white border border-slate-100 rounded-md shadow-sm p-4">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Left: toolbar controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="w-full md:w-[420px]">
  <Label className="text-xs text-slate-500 mb-1 block">Search</Label>

  <div className="flex items-center h-9 bg-white border border-slate-200 rounded-md px-3">
    <Filter className="h-4 w-4 text-slate-400 mr-2" />

    <Input
      value={filterName}
      onChange={(e) => setFilterName(e.target.value)}
      placeholder="Search categories..."
      className="h-8 bg-transparent placeholder:text-slate-400 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      aria-label="Search categories"
    />

    {filterName && (
      <button
        onClick={() => setFilterName("")}
        className="text-slate-400 hover:text-slate-600 ml-2"
        aria-label="Clear search"
      >
        <X className="h-4 w-4" />
      </button>
    )}
  </div>
</div>

            {/* Main category */}
            <div className="w-48">
              <Label className="text-xs text-slate-500 mb-1">Main</Label>
              <Select
                value={filterMainCategory}
                onValueChange={(val) => { setFilterMainCategory(val); setFilterSubCategory('all'); }}
              >
                <SelectTrigger className="h-9 rounded-md border border-slate-100 bg-white">
                  <SelectValue placeholder="All Main" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Main</SelectItem>
                  {mainCategories.filter(mc => mc._id).map((mc) => (
                    <SelectItem key={mc._id} value={mc._id!}>{mc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sub category */}
            <div className="w-48">
              <Label className="text-xs text-slate-500 mb-1">Sub</Label>
              <Select
                disabled={filterMainCategory === 'all'}
                value={filterSubCategory}
                onValueChange={setFilterSubCategory}
              >
                <SelectTrigger className="h-9 rounded-md border border-slate-100 bg-white">
                  <SelectValue placeholder={filterMainCategory === 'all' ? 'Select main first' : 'All Sub'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Sub</SelectItem>
                  {subCategoriesForSelectedMain.filter(sc => sc._id).map((sc) => (
                    <SelectItem key={sc._id} value={sc._id!}>{sc.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Right: reset + meta */}
          <div className="flex items-center gap-3 justify-end">
            <div className="text-sm text-slate-500 mr-2 hidden sm:block">
              Showing <span className="font-medium text-slate-700">{filteredCategories.length}</span> of <span className="font-medium text-slate-700">{categories.length}</span>
            </div>

            <Button variant="ghost" size="sm" onClick={resetFilters} className="text-slate-600 hover:text-slate-800">
              <X className="h-4 w-4 mr-2" /> Reset
            </Button>
          </div>
        </div>
      </div>

      {/* Results list */}
      <div>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-white border border-slate-100 rounded-md shadow-sm overflow-hidden">
            {/* header row for list */}
            <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="text-sm font-medium text-slate-900">Categories</h3>
                <p className="text-xs text-slate-500">Manage categories and sub-categories</p>
              </div>

              <div className="text-xs text-slate-500 hidden sm:block">
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> Loading...
                  </div>
                ) : (
                  <div>Showing <span className="font-medium text-slate-700">{filteredCategories.length}</span> of <span className="font-medium text-slate-700">{categories.length}</span></div>
                )}
              </div>
            </div>

            {/* body */}
            <div className="p-4">
              {loading ? (
                <div className="flex justify-center p-8 text-slate-400">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : filteredCategories.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  No categories match your filters.
                </div>
              ) : (
                <div className="space-y-3">
                  {/* We'll keep your CategoryList component — render it within a nicer wrapper.
                      If CategoryList returns raw rows, it will still render correctly.
                      If you want me to refactor CategoryList for the new card style I can do that too. */}
                  <CategoryList
                    categories={filteredCategories}
                    onEdit={openEditSheet}
                    onDelete={handleDeleteCategory}
                    allCategories={categories}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Helpful hint / footer */}
      <div className="text-sm text-slate-500">
        Tip: Use the toolbar above to quickly narrow down categories. Selecting a "Main" will enable its Sub list for faster searching.
      </div>
    </div>
  );
}
