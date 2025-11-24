'use client';

import { MediaAssetData } from './MediaAssetForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Lock, Calendar, Clock } from "lucide-react";
import { useAuth } from '../app/context/AuthContext';

interface MediaAssetListProps {
  assets: MediaAssetData[];
  onEdit: (asset: MediaAssetData) => void;
  onDelete: (assetId: string) => void;
}

export default function MediaAssetList({ assets, onEdit, onDelete }: MediaAssetListProps) {
  const { isAdmin } = useAuth();

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';

  const date = new Date(dateString);

  // Check if the date conversion resulted in an invalid date
  if (isNaN(date.getTime())) {
    return '-';
  }

  // Use 'en-GB' locale for English (UK) format (day month year)
  // Options ensure a clean, standard date representation
  const options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short', // e.g., "Oct" for October
    day: 'numeric',
  };

  return date.toLocaleDateString('en-GB', options);
};


  const formatDuration = (duration: string) => {
    if (!duration) return '-';
    return duration;
  };

  return (
    <div className="overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 hover:bg-slate-50 border-b border-slate-200">
            <TableHead className="font-semibold text-slate-700 py-3.5">
              Genre (Main)
            </TableHead>
            <TableHead className="font-semibold text-slate-700 py-3.5">
              Item (Sub)
            </TableHead>
            <TableHead className="font-semibold text-slate-700 py-3.5">
              Subject
            </TableHead>
            <TableHead className="font-semibold text-slate-700 py-3.5">
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                Duration
              </div>
            </TableHead>
            <TableHead className="font-semibold text-slate-700 py-3.5">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Created
              </div>
            </TableHead>
            <TableHead className="w-[60px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                No assets to display
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset, index) => (
              <TableRow 
                key={asset._id} 
                className={`
                  border-b border-slate-100 transition-colors
                  hover:bg-blue-50/50 
                  ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'}
                `}
              >
                <TableCell className="py-3.5">
                  <Badge 
                    variant="secondary" 
                    className="font-semibold bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-800 border border-blue-200 shadow-sm"
                  >
                    {asset.genre}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-slate-900 py-3.5">
                  {asset.item}
                </TableCell>
                <TableCell className="text-slate-700 py-3.5 max-w-xs">
                  <div className="truncate" title={asset.subject}>
                    {asset.subject}
                  </div>
                </TableCell>
                <TableCell className="py-3.5">
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-sm font-medium">
                    <Clock className="h-3.5 w-3.5 text-slate-500" />
                    {formatDuration(asset.duration)}
                  </div>
                </TableCell>
                <TableCell className="text-slate-600 py-3.5">
                  <div className="flex items-center gap-1.5 text-sm">
                    <Calendar className="h-3.5 w-3.5 text-slate-400" />
                    {formatDate(asset.creationDate)}
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
                          onClick={() => onEdit(asset)} 
                          className="cursor-pointer focus:bg-blue-50 focus:text-blue-900"
                        >
                          <Pencil className="mr-2 h-4 w-4" /> 
                          Edit Asset
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(asset._id!)} 
                          className="text-red-600 focus:text-red-700 focus:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="mr-2 h-4 w-4" /> 
                          Delete Asset
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}