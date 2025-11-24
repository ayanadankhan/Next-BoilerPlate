'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../context/AuthContext'; // Import useAuth
import MediaAssetForm, { MediaAssetData } from '@/components/MediaAssetForm';
import MediaAssetList from '@/components/MediaAssetList';
import { CategoryData } from '@/components/CategoryForm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Filter, X, ChevronLeft, ChevronRight, Loader2 } from "lucide-react";
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
  const [totalAssets, setTotalAssets] = useState(0); // Total count from server

  // --- UI States ---
  const [loading, setLoading] = useState<boolean>(true);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editAsset, setEditAsset] = useState<MediaAssetData | null>(null);

  // --- Filter States ---
  const [filterSubject, setFilterSubject] = useState('');
  const [filterMainCat, setFilterMainCat] = useState<string>('all');
  const [filterSubCat, setFilterSubCat] = useState<string>('all');
  const [filterDuration, setFilterDuration] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  // --- Pagination States ---
  const [currentPage, setCurrentPage] = useState(1);
  const [assetsPerPage, setAssetsPerPage] = useState(10); // Limit

  // Calculate total pages for UI display
  const totalPages = Math.ceil(totalAssets / assetsPerPage);

  // --- Server-Side Fetch Effect ---
  useEffect(() => {
    // 1. Build the API URL with current states
    const buildApiUrl = () => {
      const params = new URLSearchParams();
      
      // Pagination Params
      params.append('page', currentPage.toString());
      params.append('limit', assetsPerPage.toString());

      // Filter Params
      if (filterSubject) params.append('subject', filterSubject);
      // NOTE: We pass the ID to the server. The server must handle the Category/Subcategory lookup.
      if (filterMainCat !== 'all') params.append('mainCat', filterMainCat);
      if (filterSubCat !== 'all') params.append('subCat', filterSubCat);
      if (filterDuration) params.append('duration', filterDuration);
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
          // Fetch categories only once (or if the list is empty)
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
    
    // Check if a filter changed. If so, reset to page 1 and trigger re-fetch.
    const isFilterChanged = () => {
        // A simple heuristic to check if any filter value is active or non-default
        return filterSubject || filterMainCat !== 'all' || filterSubCat !== 'all' || filterDuration || dateFrom || dateTo;
    }
    
    // If we're on a non-default page (1) and filters were just applied, reset the page.
    if (currentPage > 1 && isFilterChanged()) {
        setCurrentPage(1);
    } else {
        fetchData();
    }
    
    // Dependencies include all states that affect the API query
  }, [
    currentPage, assetsPerPage, categories.length,
    filterSubject, filterMainCat, filterSubCat, filterDuration, dateFrom, dateTo 
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
    setFilterDuration('');
    setDateFrom('');
    setDateTo('');
    setCurrentPage(1); // Crucial: Reset page on filter reset
  };

  // NOTE: Asset Submission/Deletion handlers should ideally also trigger the main fetchData effect 
  // instead of fetching ALL assets again, but for simplicity, the current implementation is acceptable.

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
        // Trigger re-fetch using the state change (will re-apply current filters/pagination)
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
        alert(`Successfully imported ${bulkData.length} assets.`);
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
    if (!confirm("Are you sure you want to delete this asset?")) return;
    try {
      const response = await fetch(`/api/media-assets/${assetId}`, { method: 'DELETE' });
      if (response.ok) {
        // Trigger re-fetch (to handle potential blank page if last item was deleted)
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
      alert("You must be an Admin to edit assets.");
      return;
    }
    setEditAsset(asset);
    setIsSheetOpen(true);
  };
  
  // No need for filteredAssets useMemo anymore, as 'assets' is already filtered/paginated

  // Show a loading screen while authentication is resolving
  if (isAuthLoading) {
    return (
      <div className="flex justify-center items-center h-[50vh] text-slate-500">
        <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading Authentication...
      </div>
    );
  }

  // Restrict access if not authenticated
  if (!isAuthenticated) {
    return (
      <Card className="max-w-xl mx-auto mt-10">
        <CardHeader>
          <CardTitle>Access Denied</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-slate-600">
            You must be signed in to view the Media Asset Library. Please sign in via the button in the navigation bar.
          </p>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm text-yellow-800">
            <p className="font-medium">Client Role:</p>
            <p>Clients can view and filter all content.</p>
            <p className="font-medium mt-2">Admin Role:</p>
            <p>Admins can view, filter, add, edit, and delete content.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6 fade-in">

      {/* 1. HEADER & ACTION - Uses Sheet */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Media Library</h1>
          <p className="text-slate-500">
            {isAdmin ? "Admin: Full control over assets." : "Client: View and filter access only."}
          </p>
        </div>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            {/* Only show the Add button if the user is Admin */}
            <Button
              onClick={() => { setEditAsset(null); setIsSheetOpen(true); }}
              className="shadow-sm"
              disabled={!isAdmin}
            >
              <Plus className="mr-2 h-4 w-4" /> Add New Asset
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="sm:max-w-md w-full md:w-[500px] lg:w-[600px] overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{editAsset ? 'Edit Asset' : 'Create New Asset'}</SheetTitle>
              <SheetDescription>
                Fill in the details below. Click save when you're done.
              </SheetDescription>
            </SheetHeader>
            <MediaAssetForm
              onSubmit={handleAssetSubmit}
              onBulkSubmit={handleBulkSubmit}
              initialValues={editAsset || undefined}
              categories={categories}
              buttonText={editAsset ? 'Save Changes' : 'Create Asset'}
              onCancel={() => setIsSheetOpen(false)}
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* 2. ADVANCED FILTER BAR (Visible to all authenticated users) */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-medium flex items-center gap-2">
              <Filter className="h-4 w-4 text-indigo-600" />
              Advanced Filters
            </CardTitle>
            {(filterSubject || filterMainCat !== 'all' || filterSubCat !== 'all' || filterDuration || dateFrom || dateTo) && (
              <Button variant="ghost" size="sm" onClick={resetFilters} className="text-red-500 hover:text-red-700 h-8 px-2">
                <X className="h-3 w-3 mr-1" /> Reset
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
            {/* Subject Search */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Subject</Label>
              <Input
                placeholder="Search..."
                value={filterSubject}
                onChange={(e) => setFilterSubject(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Main Category */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Genre (Main)</Label>
              <Select value={filterMainCat} onValueChange={(val) => { setFilterMainCat(val); setFilterSubCat('all'); }}>
                <SelectTrigger className="h-9">
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
              <Label className="text-xs font-semibold text-slate-500">Item (Sub)</Label>
              <Select
                value={filterSubCat}
                onValueChange={setFilterSubCat}
                disabled={filterMainCat === 'all'}
              >
                <SelectTrigger className="h-9">
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

            {/* Duration */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">Duration</Label>
              <Input
                placeholder="e.g. 10:30"
                value={filterDuration}
                onChange={(e) => setFilterDuration(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Date From */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">From Date</Label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="h-9"
              />
            </div>

            {/* Date To */}
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-slate-500">To Date</Label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="h-9"
              />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* 2.5. PAGINATION CONTROLS */}
      {totalPages > 1 && (
          <div className="flex justify-between items-center gap-4 text-sm pt-2">
              <Select value={assetsPerPage.toString()} onValueChange={(val) => { 
                setAssetsPerPage(parseInt(val));
                setCurrentPage(1); // Reset page when changing limit
              }}>
                <SelectTrigger className="w-[180px] h-9">
                  <SelectValue placeholder="10 per page" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="25">25 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-medium">
                    Page **{currentPage}** of **{totalPages}** ({totalAssets} Assets)
                </span>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                >
                    <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                >
                    <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
          </div>
      )}


      {/* 3. RESULTS LIST */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8 text-slate-500">
              <Loader2 className="mr-2 h-6 w-6 animate-spin" /> Loading assets...
            </div>
          ) : (
            <>
              <div className="mb-2 text-sm text-slate-500 text-right">
                Showing {assets.length} results on this page
              </div>
              {assets.length === 0 ? (
                <div className="text-center p-10 text-slate-500 border rounded-lg">
                  No media assets found matching the current filters.
                </div>
              ) : (
                <MediaAssetList
                  assets={assets} // Now using the paginated 'assets' state
                  onEdit={openEditSheet}
                  onDelete={handleDeleteAsset}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}