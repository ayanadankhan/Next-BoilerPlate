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
import { MoreHorizontal, Pencil, Trash2, Lock, FolderOpen, Folder, Network } from 'lucide-react';
import { useAuth } from '../app/context/AuthContext';

interface CategoryListProps {
  categories: CategoryData[];
  onEdit: (category: CategoryData) => void;
  onDelete: (categoryId: string) => void;
  allCategories: CategoryData[];
}

export default function CategoryList({
  categories,
  onEdit,
  onDelete,
  allCategories,
}: CategoryListProps) {
  const { isAdmin } = useAuth();

  const getParentName = (parentId: string | null | undefined) => {
    if (!parentId) return null;
    const parent = allCategories.find(c => c._id === parentId);
    return parent ? parent.name : 'N/A';
  };

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 py-3.5 w-[35%]">
              Genre Name
            </TableHead>
            <TableHead className="font-semibold text-slate-700 py-3.5 w-[30%]">
              <div className="flex items-center gap-1.5">
                <Network className="h-3.5 w-3.5" />
                Parent Genre
              </div>
            </TableHead>
            <TableHead className="font-semibold text-slate-700 py-3.5 w-[20%]">
              Type
            </TableHead>
            <TableHead className="font-semibold text-slate-700 py-3.5 w-[10%] text-center">
              Level
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-slate-500">
                No Genre to display
              </TableCell>
            </TableRow>
          ) : (
            categories.map((category, index) => {
              const parentName = getParentName(category.parentId);
              const isMain = !category.parentId;

              return (
                <TableRow 
                  key={category._id}
                  className={`
                    border-b border-slate-100 transition-colors
                    hover:bg-indigo-50/50 
                    ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                  `}
                >
                  <TableCell className="py-3.5">
                    <div className="flex items-center gap-2">
                      {isMain ? (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                          <Folder className="h-4 w-4 text-indigo-700" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="h-4 w-4 text-blue-700" />
                        </div>
                      )}
                      <span className="font-medium text-slate-900">{category.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-slate-700 py-3.5">
                    {parentName ? (
                      <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-slate-300"></div>
                        <span className="text-sm">{parentName}</span>
                      </div>
                    ) : (
                      <span className="text-slate-400 text-sm italic">Root level</span>
                    )}
                  </TableCell>
                  <TableCell className="py-3.5">
                    <Badge 
                      variant={isMain ? 'default' : 'secondary'}
                      className={`font-semibold shadow-sm ${
                        isMain 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0' 
                          : 'bg-gradient-to-r from-blue-100 to-cyan-100 text-blue-800 border border-blue-200'
                      }`}
                    >
                      {isMain ? 'Genre' : 'Sub-Genre'}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-3.5 text-center">
                    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                      isMain 
                        ? 'bg-indigo-100 text-indigo-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isMain ? '1' : '2'}
                    </div>
                  </TableCell>
                  <TableCell className="py-3.5">
                    {isAdmin ? (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="h-8 w-8 p-0 hover:bg-slate-200 transition-colors"
                          >
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4 text-slate-600" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="font-semibold text-slate-900">
                            Actions
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => onEdit(category)} 
                            className="cursor-pointer focus:bg-indigo-50 focus:text-indigo-900"
                          >
                            <Pencil className="mr-2 h-4 w-4" /> 
                            Edit Genre
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => onDelete(category._id!)}
                            className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> 
                            Delete Genre
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ) : (
                      <div 
                        className="flex items-center justify-center p-2 text-slate-400 hover:text-slate-500 transition-colors" 
                        title="Admin access required"
                      >
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