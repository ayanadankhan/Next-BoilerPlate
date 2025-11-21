'use client';

import { CategoryData } from './CategoryForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Pencil, Trash2, Lock } from 'lucide-react';
import { useAuth } from '../app/context/AuthContext'; // Relative import for AuthContext

interface CategoryListProps {
  categories: CategoryData[];
  onEdit: (category: CategoryData) => void;
  onDelete: (categoryId: string) => void;
  allCategories: CategoryData[]; // Needed to map parentId to name
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
  allCategories,
}: CategoryListProps) {
  const { isAdmin } = useAuth(); // Get the admin status

  const getParentName = (parentId: string | null | undefined) => {
    if (!parentId) return null;
    const parent = allCategories.find(c => c._id === parentId);
    return parent ? parent.name : 'N/A';
  };

  return (
    <div className="rounded-md border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40%]">Category Name</TableHead>
            <TableHead className="w-[40%]">Parent Genre</TableHead>
            <TableHead className="w-[15%] text-center">Type</TableHead>
            <TableHead className="w-[50px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                No categories found.
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category) => {
              const parentName = getParentName(category.parentId);
              const isMain = !category.parentId;

              return (
                <TableRow key={category._id}>
                  <TableCell className="font-medium text-slate-700">
                    {category.name}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {parentName || <span className="text-muted-foreground">-</span>}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant={isMain ? 'default' : 'secondary'}>
                      {isMain ? 'Main Genre' : 'Sub-Category'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {isAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem 
                            onClick={() => onEdit(category)} 
                            className="cursor-pointer"
                          >
                            <Pencil className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(category._id!)}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div className="p-2 text-muted-foreground" title="Admin access required">
                        <Lock className="h-4 w-4" />
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}