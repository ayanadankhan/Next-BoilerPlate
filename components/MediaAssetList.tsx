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
import { MoreHorizontal, Pencil, Trash2, Lock } from "lucide-react";
import { useAuth } from '../app/context/AuthContext'; // Import useAuth

interface MediaAssetListProps {
  assets: MediaAssetData[];
  onEdit: (asset: MediaAssetData) => void;
  onDelete: (assetId: string) => void;
}

export default function MediaAssetList({ assets, onEdit, onDelete }: MediaAssetListProps) {
  const { isAdmin } = useAuth(); // Get the admin status

  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    // Ensure it's a valid date before formatting
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '-';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="rounded-md border bg-white shadow-sm">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Genre (Main)</TableHead>
            <TableHead>Item (Sub)</TableHead>
            <TableHead>Subject</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead className="text-right">Date</TableHead>
            <TableHead className="w-[70px]"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {assets.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                No assets found.
              </TableCell>
            </TableRow>
          ) : (
            assets.map((asset) => (
              <TableRow key={asset._id}>
                <TableCell>
                  <Badge variant="secondary" className="font-semibold">
                    {asset.genre}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-slate-700">{asset.item}</TableCell>
                <TableCell className="text-slate-600">{asset.subject}</TableCell>
                <TableCell>{asset.duration}</TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {formatDate(asset.creationDate)}
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
                        <DropdownMenuItem onClick={() => onEdit(asset)} className="cursor-pointer">
                          <Pencil className="mr-2 h-4 w-4" /> Edit
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => onDelete(asset._id!)} 
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
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}