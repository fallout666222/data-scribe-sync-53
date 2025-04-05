
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Save, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { updateRecord, deleteRecord } from '@/services/api';

interface DataTableProps {
  data: any[];
  tableName: string;
  onDataChange: () => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, tableName, onDataChange }) => {
  const [editingRow, setEditingRow] = useState<number | null>(null);
  const [editedData, setEditedData] = useState<any>({});

  if (!data || data.length === 0) {
    return <div className="text-center py-8">No data available</div>;
  }

  const columns = Object.keys(data[0]);

  const handleEdit = (rowIndex: number) => {
    setEditingRow(rowIndex);
    setEditedData({ ...data[rowIndex] });
  };

  const handleChange = (column: string, value: string) => {
    setEditedData(prev => ({ ...prev, [column]: value }));
  };

  const handleSave = async () => {
    if (editingRow === null) return;
    
    const id = editedData.id;
    if (!id) {
      console.error('Record is missing ID field');
      return;
    }
    
    const success = await updateRecord(tableName, id, editedData);
    if (success) {
      onDataChange();
      setEditingRow(null);
    }
  };

  const handleCancel = () => {
    setEditingRow(null);
    setEditedData({});
  };

  const handleDelete = async (id: string | number) => {
    if (!id) {
      console.error('Record is missing ID field');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this record?')) {
      const success = await deleteRecord(tableName, id);
      if (success) {
        onDataChange();
      }
    }
  };

  return (
    <div className="border rounded-md overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column} className="font-semibold">
                {column}
              </TableHead>
            ))}
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {columns.map((column) => (
                <TableCell key={column}>
                  {editingRow === rowIndex ? (
                    <Input
                      value={editedData[column] || ''}
                      onChange={(e) => handleChange(column, e.target.value)}
                      className="w-full"
                    />
                  ) : (
                    String(row[column] !== null ? row[column] : '')
                  )}
                </TableCell>
              ))}
              <TableCell className="text-right">
                {editingRow === rowIndex ? (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={handleCancel}>
                      <X className="h-4 w-4 mr-1" /> Cancel
                    </Button>
                    <Button size="sm" onClick={handleSave}>
                      <Save className="h-4 w-4 mr-1" /> Save
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(rowIndex)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDelete(row.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default DataTable;
