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
import { Plus, Filter, X, Loader2 } from "lucide-react";
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
  const { user, isLoading: isAuthLoading, isAuthenticated, isAdmin } = useAuth(); // Auth hook
  
  // --- Data States ---
  const [assets, setAssets] = useState<MediaAssetData[]>([]);
  const [categories, setCategories] = useState<CategoryData[]>([]);
  
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

  // --- Initial Fetch ---
  useEffect(() => {
    const fetchData = async () => {
        setLoading(true);
        try {
            const [resAssets, resCats] = await Promise.all([
                fetch('/api/media-assets'),
                fetch('/api/categories')
            ]);
            
            if (resAssets.ok && resCats.ok) {
              const assetData = await resAssets.json();
              const catData = await resCats.json();
              setAssets(assetData.mediaAssets);
              setCategories(catData.categories);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    fetchData();
  }, []);

  // --- Derived Data for Dropdowns ---
  const mainCategories = categories.filter(c => !c.parentId);
  
  const availableSubCategories = useMemo(() => {
    if (filterMainCat === 'all') return [];
    return categories.filter(c => c.parentId === filterMainCat);
  }, [categories, filterMainCat]);

  // --- The Efficient Multi-Filter Logic ---
  const filteredAssets = useMemo(() => {
    // ... [Filter logic remains the same] ...
    return assets.filter(asset => {
      // 1. Subject Filter
      if (filterSubject && !asset.subject.toLowerCase().includes(filterSubject.toLowerCase())) {
        return false;
      }

      // 2. Main Category Filter
      if (filterMainCat !== 'all') {
        const mainCat = categories.find(c => c._id === filterMainCat);
        if (mainCat && asset.genre !== mainCat.name) return false;
      }

      // 3. Sub Category Filter
      if (filterSubCat !== 'all') {
        if (asset.categoryId && asset.categoryId !== filterSubCat) return false;
        if (!asset.categoryId) {
           const subCat = categories.find(c => c._id === filterSubCat);
           if (subCat && asset.item !== subCat.name) return false;
        }
      }

      // 4. Duration Filter
      if (filterDuration && !asset.duration.includes(filterDuration)) {
        return false;
      }

      // 5. Date Range Filter
      if (asset.creationDate) {
        const assetDate = new Date(asset.creationDate).setHours(0,0,0,0);
        
        if (dateFrom) {
          const from = new Date(dateFrom).setHours(0,0,0,0);
          if (assetDate < from) return false;
        }
        
        if (dateTo) {
          const to = new Date(dateTo).setHours(0,0,0,0);
          if (assetDate > to) return false;
        }
      }

      return true;
    });
  }, [assets, categories, filterSubject, filterMainCat, filterSubCat, filterDuration, dateFrom, dateTo]);

  // --- Handlers ---
  const resetFilters = () => {
    setFilterSubject('');
    setFilterMainCat('all');
    setFilterSubCat('all');
    setFilterDuration('');
    setDateFrom('');
    setDateTo('');
  };

  const handleAssetSubmit = async (assetData: MediaAssetData) => {
    if (!isAdmin) {
        alert("You do not have permission to perform this action.");
        return;
    }
    try {
      const isEdit = editAsset && editAsset._id;
      // Note: In a real app, API routes would check the user session for 'isAdmin'
      const url = isEdit ? `/api/media-assets/${editAsset._id}` : '/api/media-assets';
      const method = isEdit ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(assetData),
      });
      
      if (response.ok) {
        const res = await fetch('/api/media-assets');
        const data = await res.json();
        setAssets(data.mediaAssets);
        setIsSheetOpen(false); // Close the Sheet
        setEditAsset(null);
      } else {
        alert("Operation failed due to permission or server error.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAsset = async (assetId: string) => {
    if (!isAdmin) {
        alert("You do not have permission to perform this action.");
        return;
    }
    if(!confirm("Are you sure you want to delete this asset?")) return;
    try {
      // Note: API route must also check for Admin role
      const response = await fetch(`/api/media-assets/${assetId}`, { method: 'DELETE' });
      if (response.ok) {
        setAssets(prev => prev.filter(a => a._id !== assetId));
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

      {/* 3. RESULTS LIST */}
      <Card className="border-0 shadow-none bg-transparent">
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center p-8 text-slate-500">Loading assets...</div>
          ) : (
            <>
                <div className="mb-2 text-sm text-slate-500 text-right">
                    Showing {filteredAssets.length} results
                </div>
                <MediaAssetList 
                assets={filteredAssets} 
                onEdit={openEditSheet} // Using the restricted openEditSheet handler
                onDelete={handleDeleteAsset} // Using the restricted handleDeleteAsset handler
                />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}