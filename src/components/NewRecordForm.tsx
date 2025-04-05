
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createRecord } from '@/services/api';
import { PlusCircle } from 'lucide-react';

interface NewRecordFormProps {
  tableName: string;
  columns: string[];
  onRecordCreated: () => void;
}

const NewRecordForm: React.FC<NewRecordFormProps> = ({ tableName, columns, onRecordCreated }) => {
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [isExpanded, setIsExpanded] = useState(false);

  const handleChange = (column: string, value: string) => {
    setFormData(prev => ({ ...prev, [column]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newRecord = await createRecord(tableName, formData);
    if (newRecord) {
      setFormData({});
      onRecordCreated();
      setIsExpanded(false);
    }
  };

  if (!isExpanded) {
    return (
      <div className="my-4">
        <Button 
          onClick={() => setIsExpanded(true)}
          className="w-full"
        >
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Record
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg bg-muted/50 my-4">
      <h3 className="text-lg font-medium">Add New Record</h3>
      
      {columns.filter(col => col !== 'id').map((column) => (
        <div key={column} className="grid gap-2">
          <Label htmlFor={column}>{column}</Label>
          <Input
            id={column}
            value={formData[column] || ''}
            onChange={(e) => handleChange(column, e.target.value)}
            placeholder={`Enter ${column}`}
          />
        </div>
      ))}
      
      <div className="flex gap-2 justify-end">
        <Button variant="outline" type="button" onClick={() => setIsExpanded(false)}>
          Cancel
        </Button>
        <Button type="submit">
          Create Record
        </Button>
      </div>
    </form>
  );
};

export default NewRecordForm;
