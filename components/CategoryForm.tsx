'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Save, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

// Define the data structure for categories globally
export interface CategoryData {
  _id?: string;
  name: string;
  parentId?: string | null; // Nullable for main categories
}

interface CategoryFormProps {
  onSubmit: (data: CategoryData) => void;
  initialValues?: CategoryData;
  categories: CategoryData[]; // All categories (for parent selection)
  buttonText: string;
  onCancel: () => void;
}

export default function CategoryForm({
  onSubmit,
  initialValues,
  categories,
  buttonText,
  onCancel,
}: CategoryFormProps) {
  const [name, setName] = useState(initialValues?.name || '');
  const [parentId, setParentId] = useState<string | null>(initialValues?.parentId || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter out the category being edited from its own potential parents
  const availableParents = categories.filter(
    (c) => !c.parentId && c._id !== initialValues?._id
  );

  useEffect(() => {
    // Reset state when initialValues change (for edit mode)
    setName(initialValues?.name || '');
    setParentId(initialValues?.parentId || null);
  }, [initialValues]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    
    const data: CategoryData = {
      name: name.trim(),
      parentId: parentId || null,
    };
    if (initialValues?._id) {
      data._id = initialValues._id;
    }

    // Call the parent component's submit handler
    onSubmit(data);
    
    // Assume success is handled externally, but re-enable form quickly
    setTimeout(() => setIsSubmitting(false), 500); 
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 pt-6">
      {/* Category Name */}
      <div className="grid gap-2">
        <Label htmlFor="category-name">Category Name</Label>
        <Input
          id="category-name"
          placeholder="e.g., Documentary, Action, News"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
      </div>

      {/* Parent Category Selection (for creating a Sub-Category) */}
      <div className="grid gap-2">
        <Label htmlFor="parent-category">Parent Genre (Optional, for Sub-Category)</Label>
        <Select
          value={parentId || 'none'}
          onValueChange={(value) => setParentId(value === 'none' ? null : value)}
        >
          <SelectTrigger id="parent-category">
            <SelectValue placeholder="Select a parent category (Main Genre)" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">
              (No Parent - This is a Main Genre)
            </SelectItem>
            {availableParents.map((category) => (
              <SelectItem key={category._id} value={category._id!}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="mr-2 h-4 w-4" /> Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          {buttonText}
        </Button>
      </div>
    </form>
  );
}