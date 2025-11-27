'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import MediaAssetForm, { MediaAssetData } from '@/components/MediaAssetForm';
import MediaAssetList from '@/components/MediaAssetList';
import { CategoryData } from '@/components/CategoryForm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, X, ChevronLeft, ChevronRight, Loader2, Search, LayoutGrid, Table2 } from "lucide-react";
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

export default function MediaAssetsPage() {
  const { user, isLoading: isAuthLoading, isAuthenticated, isAdmin } = useAuth();

  // --- Data States ---
  const [assets, setAssets] = useState<MediaAssetData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [totalAssets, setTotalAssets] = useState(0);

  // --- UI States ---
  const [loading, setLoading] = useState<boolean>(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<MediaAssetData | null>(null);
  const [showFilters, setShowFilters] = useState(true);

  // --- Filter States ---
  const [filterSubject, setFilterSubject] = useState('');
  const [filterMainCat, setFilterMainCat] = useState<string>('all');
  const [filterSubCat, setFilterSubCat] = useState<string>('all');
  const [minDuration, setMinDuration] = useState('');
  const [maxDuration, setMaxDuration] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [assetsPerPage, setAssetsPerPage] = useState(10);

  const totalPages = Math.ceil(totalAssets / assetsPerPage);

  // Check if any filters are active
  const hasActiveFilters = filterSubject || filterMainCat !== 'all' || filterSubCat !== 'all' || minDuration || maxDuration || dateFrom || dateTo;

  // --- Server-Side Fetch Effect ---
  useEffect(() => {
    const buildApiUrl = () => {
      const params = new URLSearchParams();

      params.append('page', currentPage.toString());
      params.append('limit', assetsPerPage.toString());

      if (filterSubject) params.append('subject', filterSubject);
      if (filterMainCat !== 'all') params.append('mainCat', filterMainCat);
      if (filterSubCat !== 'all') params.append('subCat', filterSubCat);
      if (minDuration) params.append('minDuration', minDuration);
      if (maxDuration) params.append('maxDuration', maxDuration);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      return `/api/media-assets?${params.toString()}`;
    };

    const fetchData = async () => {
      setLoading(true);
      try {
        const assetUrl = buildApiUrl();
        const [resAssets, resCats] = await Promise.all([
          fetch(assetUrl),
          categories.length === 0 ? fetch('/api/categories') : Promise.resolve({ ok: true, json: () => ({ categories: [] }) }),
        ]);

        if (resAssets.ok) {
          const assetData = await resAssets.json();
          setAssets(assetData.mediaAssets);
          setTotalAssets(assetData.totalAssets);
        }

        if (categories.length === 0 && resCats.ok) {
          const catData = await resCats.json();
          setCategories(catData.categories);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const isFilterChanged = () => {
      return filterSubject || filterMainCat !== 'all' || filterSubCat !== 'all' || minDuration || maxDuration || dateFrom || dateTo;
    }

    if (currentPage > 1 && isFilterChanged()) {
      setCurrentPage(1);
    } else {
      fetchData();
    }
  }, [
    currentPage, assetsPerPage, categories.length,
    filterSubject, filterMainCat, filterSubCat, minDuration, maxDuration, dateFrom, dateTo
  ]);

  // --- Derived Data for Dropdowns ---
  const mainCategories = useMemo(() => categories.filter(c => !c.parentId), [categories]);

  const availableSubCategories = useMemo(() => {
    if (filterMainCat === 'all') return [];
    return categories.filter(c => c.parentId === filterMainCat);
  }, [categories, filterMainCat]);

  // --- Handlers ---
  const resetFilters = () => {
    setFilterSubject('');
    setFilterMainCat('all');
    setFilterSubCat('all');
    setMinDuration('');
    setMaxDuration('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1);
  };

  const handleAssetSubmit = async (assetData: MediaAssetData) => {
    if (!isAdmin) {
      alert("You do not have permission to perform this action.");
      return;
    }
    try {
      const isEdit = editAsset && editAsset._id;
      const url = isEdit ? `/api/media-assets/${editAsset._id}` : '/api/media-assets';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData),
      });

      if (response.ok) {
        setCurrentPage(1);
        setIsSheetOpen(false);
        setEditAsset(null);
      } else {
        alert("Operation failed due to permission or server error.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleBulkSubmit = async (bulkData: MediaAssetData[]) => {
    if (!isAdmin) {
      alert("You do not have permission to perform this action.");
      return;
    }
    try {
      const response = await fetch('/api/media-assets', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bulkData),
      });

      if (response.ok) {
        setCurrentPage(1);
        setIsSheetOpen(false);
        setEditAsset(null);
        alert(`Successfully imported ${bulkData.length} items.`);
      } else {
        alert("Bulk import failed.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred during bulk import.");
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!isAdmin) {
      alert("You do not have permission to perform this action.");
      return;
    }
    if (!confirm("Are you sure you want to delete this item?")) return;
    try {
      const response = await fetch(`/api/media-assets/${assetId}`, { method: 'DELETE' });
      if (response.ok) {
        setCurrentPage(prev => (assets.length === 1 && prev > 1) ? prev - 1 : prev);
      } else {
        alert("Deletion failed due to permission or server error.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openEditSheet = (asset: MediaAssetData) => {
    if (!isAdmin) {
      alert("You must be an Admin to edit item.");
      return;
    }
    setEditAsset(asset);
    setIsSheetOpen(true);
  };

  // Show loading screen while authentication is resolving
  if (isAuthLoading) {
    return (
      <div className="flex flex-col justify-center items-center h-[60vh] space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <p className="text-sm text-slate-600 font-medium">Authenticating...</p>
      </div>
    );
  }

  // Restrict access if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto mt-16 px-4">
        <Card className="border-l-4 border-l-amber-500 shadow-lg">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-900">Authentication Required</CardTitle>
            <p className="text-slate-600 text-sm">
              Access to the Items Library requires authentication.
            </p>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-5 border border-blue-100">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                Access Levels
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-blue-700">C</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Client Role</p>
                    <p className="text-slate-600">View and filter all media content</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 w-6 h-6 rounded bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-xs font-bold text-indigo-700">A</span>
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">Admin Role</p>
                    <p className="text-slate-600">Full access to view, filter, add, edit, and delete content</p>
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

  return (
    <div className="space-y-5 fade-in pb-8">

      {/* ENHANCED HEADER */}
      <div className="bg-gradient-to-r from-slate-50 to-blue-50 -mx-6 -mt-6 px-6 py-6 border-b border-slate-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">Items Library</h1>
            <div className="flex items-center gap-2 text-sm">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-medium ${isAdmin
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
                }`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                {isAdmin ? 'Administrator' : 'Client'}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-600">
                {isAdmin ? 'Full access to all operations' : 'View & filter access'}
              </span>
            </div>
          </div>

          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button
                onClick={() => { setEditAsset(null); setIsSheetOpen(true); }}
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm font-medium"
                size="lg"
                disabled={!isAdmin}
              >
                <Plus className="mr-2 h-4 w-4" /> New Item
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="sm:max-w-md w-full md:w-[500px] lg:w-[600px] overflow-y-auto">
              <SheetHeader>
                <SheetTitle className="text-xl">{editAsset ? 'Edit Asset' : 'Create New Item'}</SheetTitle>
                <SheetDescription>
                  Fill in the details below. Click save when you're done.
                </SheetDescription>
              </SheetHeader>
              <MediaAssetForm
                onSubmit={handleAssetSubmit}
                onBulkSubmit={handleBulkSubmit}
                initialValues={editAsset || undefined}
                categories={categories}
                buttonText={editAsset ? 'Save Changes' : 'Create Item'}
                onCancel={() => setIsSheetOpen(false)}
              />
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* ENHANCED FILTER BAR */}
      <Card className="shadow-sm border-slate-200">
        <CardHeader className="pb-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <Filter className="h-4 w-4 text-blue-700" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">Filter & Search</CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {hasActiveFilters ? `${Object.keys({ filterSubject, filterMainCat, filterSubCat, minDuration, maxDuration, dateFrom, dateTo }).filter(k =>
                    (k === 'filterSubject' && filterSubject) ||
                    (k === 'filterMainCat' && filterMainCat !== 'all') ||
                    (k === 'filterSubCat' && filterSubCat !== 'all') ||
                    (k === 'minDuration' && minDuration) ||
                    (k === 'maxDuration' && maxDuration) ||
                    (k === 'dateFrom' && dateFrom) ||
                    (k === 'dateTo' && dateTo)
                  ).length} active filter(s)` : 'No filters applied'}
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Subject Search */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Subject</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search subject..."
                    value={filterSubject}
                    onChange={(e) => setFilterSubject(e.target.value)}
                    className="h-10 pl-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Main Category */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Genre (Main)</Label>
                <Select value={filterMainCat} onValueChange={(val) => { setFilterMainCat(val); setFilterSubCat('all'); }}>
                  <SelectTrigger className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Genres</SelectItem>
                    {mainCategories.map(c => (
                      <SelectItem key={c._id} value={c._id!}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Sub Category */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Item (Sub)</Label>
                <Select
                  value={filterSubCat}
                  onValueChange={setFilterSubCat}
                  disabled={filterMainCat === 'all'}
                >
                  <SelectTrigger className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50">
                    <SelectValue placeholder="All Items" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    {availableSubCategories.map(c => (
                      <SelectItem key={c._id} value={c._id!}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Duration Range */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">Duration Range</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder="Min (e.g. 5:00)"
                    value={minDuration}
                    onChange={(e) => setMinDuration(e.target.value)}
                    className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Input
                    placeholder="Max (e.g. 15:00)"
                    value={maxDuration}
                    onChange={(e) => setMaxDuration(e.target.value)}
                    className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>


              {/* Date From */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">From Date</Label>
                <Input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
              </div>

              {/* Date To */}
              <div className="space-y-2">
                <Label className="text-xs font-semibold text-slate-700 uppercase tracking-wide">To Date</Label>
                <Input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="h-10 border-slate-200 focus:border-blue-500 focus:ring-blue-500"
                />
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
                <Table2 className="h-4 w-4 text-slate-700" />
              </div>
              <div>
                <CardTitle className="text-base font-semibold text-slate-900">
                  {loading ? 'Loading...' : `${totalAssets.toLocaleString()} Total Items`}
                </CardTitle>
                <p className="text-xs text-slate-500 mt-0.5">
                  {loading ? 'Please wait' : `Showing ${assets.length} on page ${currentPage} of ${totalPages}`}
                </p>
              </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center gap-3">
                <Select value={assetsPerPage.toString()} onValueChange={(val) => {
                  setAssetsPerPage(parseInt(val));
                  setCurrentPage(1);
                }}>
                  <SelectTrigger className="w-[140px] h-9 border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 per page</SelectItem>
                    <SelectItem value="25">25 per page</SelectItem>
                    <SelectItem value="50">50 per page</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1 bg-slate-50">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    className="h-7 w-7 p-0 hover:bg-white disabled:opacity-30"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-3 text-sm font-medium text-slate-700 min-w-[60px] text-center">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                    className="h-7 w-7 p-0 hover:bg-white disabled:opacity-30"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-16 space-y-3">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
              <p className="text-sm text-slate-600 font-medium">Loading assets...</p>
            </div>
          ) : assets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4">
                <LayoutGrid className="h-8 w-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">No Assets Found</h3>
              <p className="text-sm text-slate-600 max-w-md mb-4">
                {hasActiveFilters
                  ? 'No media assets match your current filter criteria. Try adjusting your filters.'
                  : 'There are no media assets in the library yet. Start by adding your first asset.'}
              </p>
              {hasActiveFilters && (
                <Button onClick={resetFilters} variant="outline" size="sm">
                  Clear Filters
                </Button>
              )}
            </div>
          ) : (
            <MediaAssetList
              assets={assets}
              onEdit={openEditSheet}
              onDelete={handleDeleteAsset}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}