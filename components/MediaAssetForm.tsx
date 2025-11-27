// 'use client';

// import { useState, FormEvent, useEffect } from 'react';
// import { CategoryData } from './CategoryForm';
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Label } from "@/components/ui/label";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
// // Note: For complex cascading logic, standard <select> styled with Tailwind 
// // is often more robust than Radix Select, but we will style it to match shadcn perfectly.

// export interface MediaAssetData {
//   _id?: string;
//   categoryId?: string;
//   genre: string;
//   item: string;
//   subject: string;
//   duration: string;
//   creationDate: string;
// }

// interface MediaAssetFormProps {
//   onSubmit: (assetData: MediaAssetData) => void;
//   initialValues?: MediaAssetData;
//   categories: CategoryData[]; 
//   buttonText?: string;
//   onCancel?: () => void;
// }

// export default function MediaAssetForm({ 
//   onSubmit, 
//   initialValues, 
//   categories, 
//   buttonText = 'Save Changes',
//   onCancel 
// }: MediaAssetFormProps) {
  
//   const [assetData, setAssetData] = useState<MediaAssetData>({
//     categoryId: '',
//     genre: '',
//     item: '',
//     subject: '',
//     duration: '',
//     creationDate: new Date().toISOString().split('T')[0],
//   });

//   const [selectedMainCatId, setSelectedMainCatId] = useState<string>('');

//   const mainCategories = categories.filter(c => !c.parentId);
  
//   const availableSubCategories = selectedMainCatId 
//     ? categories.filter(c => c.parentId === selectedMainCatId)
//     : [];

//   useEffect(() => {
//     if (initialValues) {
//       let foundParentId = '';
//       if (initialValues.categoryId) {
//         const subCat = categories.find(c => c._id === initialValues.categoryId);
//         if (subCat && subCat.parentId) foundParentId = subCat.parentId;
//       } else {
//         const mainCatByName = categories.find(c => c.name === initialValues.genre && !c.parentId);
//         if (mainCatByName) foundParentId = mainCatByName._id!;
//       }

//       setSelectedMainCatId(foundParentId);
//       setAssetData({
//         ...initialValues,
//         creationDate: initialValues.creationDate 
//           ? new Date(initialValues.creationDate).toISOString().split('T')[0] 
//           : ''
//       });
//     }
//   }, [initialValues, categories]);

//   const handleSubmit = (e: FormEvent) => {
//     e.preventDefault();
//     onSubmit(assetData);
//   };

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     setAssetData(prev => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleMainCatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const mainId = e.target.value;
//     setSelectedMainCatId(mainId);
//     const mainCat = categories.find(c => c._id === mainId);
//     setAssetData(prev => ({
//       ...prev,
//       genre: mainCat ? mainCat.name : '',
//       categoryId: '',
//       item: '',
//     }));
//   };

//   const handleSubCatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
//     const subId = e.target.value;
//     const subCat = categories.find(c => c._id === subId);
//     setAssetData(prev => ({
//       ...prev,
//       categoryId: subId,
//       item: subCat ? subCat.name : '',
//     }));
//   };

//   // Shadcn input style class for the native selects
//   const selectClass = "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

//   return (
//     <form onSubmit={handleSubmit} className="space-y-6 py-4">
//       <div className="grid grid-cols-2 gap-4">
        
//         <div className="space-y-2">
//           <Label htmlFor="mainCategory">Main Category (Genre)</Label>
//           <select
//             id="mainCategory"
//             value={selectedMainCatId}
//             onChange={handleMainCatChange}
//             required
//             className={selectClass}
//           >
//             <option value="">Select Genre...</option>
//             {mainCategories.map((cat) => (
//               <option key={cat._id} value={cat._id}>{cat.name}</option>
//             ))}
//           </select>
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="subCategory">Subcategory (Item)</Label>
//           <select
//             id="subCategory"
//             value={assetData.categoryId || ''}
//             onChange={handleSubCatChange}
//             required
//             disabled={!selectedMainCatId}
//             className={selectClass}
//           >
//             <option value="">
//               {!selectedMainCatId ? 'Select Genre First' : 'Select Item...'}
//             </option>
//             {availableSubCategories.map((cat) => (
//               <option key={cat._id} value={cat._id}>{cat.name}</option>
//             ))}
//           </select>
//         </div>

//         <div className="col-span-2 space-y-2">
//           <Label htmlFor="subject">Subject</Label>
//           <Input 
//             id="subject" 
//             name="subject" 
//             value={assetData.subject} 
//             onChange={handleChange} 
//             required 
//             placeholder="Enter subject title..."
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="duration">Duration</Label>
//           <Input 
//             id="duration" 
//             name="duration" 
//             value={assetData.duration} 
//             onChange={handleChange} 
//             required 
//             placeholder="e.g. 10:30"
//           />
//         </div>

//         <div className="space-y-2">
//           <Label htmlFor="creationDate">Creation Date</Label>
//           <Input 
//             type="date"
//             id="creationDate" 
//             name="creationDate" 
//             value={assetData.creationDate} 
//             onChange={handleChange} 
//             required 
//           />
//         </div>
//       </div>
      
//       <div className="flex justify-end space-x-2 pt-4">
//         {onCancel && (
//           <Button type="button" variant="outline" onClick={onCancel}>
//             Cancel
//           </Button>
//         )}
//         <Button type="submit">{buttonText}</Button>
//       </div>
//     </form>
//   );
// }


'use client';

import { useState, FormEvent, useEffect } from 'react';
import { CategoryData } from './CategoryForm';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import Papa from "papaparse";

export interface MediaAssetData {
  _id?: string;
  categoryId?: string;
  genre: string;
  item: string;
  subject: string;
  duration: string;
  creationDate: string;
}

interface MediaAssetFormProps {
  onSubmit: (assetData: MediaAssetData) => void;
  initialValues?: MediaAssetData;
  categories: CategoryData[];
  onBulkSubmit?: (bulk: MediaAssetData[]) => void;
  buttonText?: string;
  onCancel?: () => void;
}

export default function MediaAssetForm({
  onSubmit,
  onBulkSubmit,
  initialValues,
  categories,
  buttonText = 'Save Changes',
  onCancel
}: MediaAssetFormProps) {

  const [assetData, setAssetData] = useState<MediaAssetData>({
    categoryId: '',
    genre: '',
    item: '',
    subject: '',
    duration: '',
    creationDate: new Date().toISOString().split('T')[0],
  });

  const [bulkData, setBulkData] = useState<MediaAssetData[]>([]);
  const [csvError, setCsvError] = useState<string>("");

  const [selectedMainCatId, setSelectedMainCatId] = useState<string>('');

  const mainCategories = categories.filter(c => !c.parentId);
  const availableSubCategories = selectedMainCatId
    ? categories.filter(c => c.parentId === selectedMainCatId)
    : [];

  useEffect(() => {
    if (initialValues) {
      let foundParentId = '';
      if (initialValues.categoryId) {
        const subCat = categories.find(c => c._id === initialValues.categoryId);
        if (subCat && subCat.parentId) foundParentId = subCat.parentId;
      }
      setSelectedMainCatId(foundParentId);
      setAssetData({
        ...initialValues,
        creationDate: initialValues.creationDate
          ? new Date(initialValues.creationDate).toISOString().split('T')[0]
          : ''
      });
    }
  }, [initialValues, categories]);

  const selectClass =
    "flex h-10 w-full rounded-md border border-slate-200 bg-background px-3 py-2 text-sm";

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (bulkData.length > 0 && onBulkSubmit) {
      onBulkSubmit(bulkData);
    } else {
      onSubmit(assetData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAssetData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleMainCatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const mainId = e.target.value;
    setSelectedMainCatId(mainId);
    const mainCat = categories.find(c => c._id === mainId);
    setAssetData(prev => ({
      ...prev,
      genre: mainCat ? mainCat.name : '',
      categoryId: '',
      item: '',
    }));
    setBulkData([]);
  };

  const handleSubCatChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const subId = e.target.value;
    const subCat = categories.find(c => c._id === subId);
    setAssetData(prev => ({
      ...prev,
      categoryId: subId,
      item: subCat ? subCat.name : '',
    }));
    setBulkData([]);
  };

  const handleCSVUpload = (file: File) => {
    setCsvError("");
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result: Papa.ParseResult<Record<string, string>>) => {
      const rows = result.data as Record<string, string>[];

      const requiredCols: string[] = ["Subject", "Duration", "Creation Date"];
      const missing: string[] = requiredCols.filter(c => !Object.keys(rows[0] || {}).includes(c));

      if (missing.length > 0) {
        setCsvError(`Missing columns: ${missing.join(", ")}`);
        return;
      }

      const subCat = categories.find(c => c._id === assetData.categoryId);
      const mainCat = categories.find(c => c._id === selectedMainCatId);

      if (!subCat || !mainCat) {
        setCsvError("Select both Main & Sub category before uploading CSV.");
        return;
      }

      const formatted: MediaAssetData[] = rows
        .filter((r: Record<string, string>) => r.Subject)
        .map((row: Record<string, string>): MediaAssetData => ({
        genre: mainCat.name,
        item: subCat.name,
        categoryId: subCat._id,
        subject: row.Subject,
        duration: row.Duration,
        creationDate: row["Creation Date"]
          ? new Date(row["Creation Date"]).toISOString().split("T")[0]
          : "",
        }));
        console.log("Parsed CSV Data:", formatted);

      setBulkData(formatted);
      },
      error: () => setCsvError("Invalid CSV file"),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 py-4">
      <div className="grid grid-cols-2 gap-4">

        {/* MAIN CATEGORY */}
        <div className="space-y-2">
          <Label>Main Category (Genre)</Label>
          <select
            value={selectedMainCatId}
            onChange={handleMainCatChange}
            required
            className={selectClass}
          >
            <option value="">Select Genre...</option>
            {mainCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* SUBCATEGORY */}
        <div className="space-y-2">
          <Label>Subcategory (Item)</Label>
          <select
            value={assetData.categoryId || ''}
            onChange={handleSubCatChange}
            required
            disabled={!selectedMainCatId}
            className={selectClass}
          >
            <option value="">
              {!selectedMainCatId ? 'Select Genre First' : 'Select Item...'}
            </option>
            {availableSubCategories.map((cat) => (
              <option key={cat._id} value={cat._id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* MANUAL ENTRY FIELDS (only if no CSV uploaded) */}
        {bulkData.length === 0 && (
          <>
            <div className="col-span-2 space-y-2">
              <Label>Subject</Label>
              <Input name="subject" value={assetData.subject} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Duration</Label>
              <Input name="duration" value={assetData.duration} onChange={handleChange} required />
            </div>

            <div className="space-y-2">
              <Label>Creation Date</Label>
              <Input type="date" name="creationDate" value={assetData.creationDate} onChange={handleChange} required />
            </div>
          </>
        )}
      </div>

      {/* CSV UPLOAD SECTION */}
      {selectedMainCatId && assetData.categoryId && (
        <Card className="mt-4">
          <CardContent className="py-4 space-y-3">
            <Label className="text-sm">Bulk Import (Optional)</Label>

            <Input
              type="file"
              accept=".csv"
              onChange={(e) => e.target.files && handleCSVUpload(e.target.files[0])}
            />

            {csvError && <p className="text-red-500 text-sm">{csvError}</p>}

            {bulkData.length > 0 && (
              <p className="text-sm text-green-600">
                {bulkData.length} records parsed from CSV. Ready to insert.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* ACTION BUTTONS */}
      <div className="flex justify-end space-x-2 pt-4">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        <Button type="submit">
          {bulkData.length > 0 ? `Import ${bulkData.length} Items` : buttonText}
        </Button>
      </div>
    </form>
  );
}
