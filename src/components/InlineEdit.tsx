
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Pencil, Check, X } from 'lucide-react';

interface InlineEditProps {
  value: number;
  onSave: (value: number) => void;
  onReset?: () => void;
  showResetButton?: boolean;
  prefix?: string;
}

export const InlineEdit: React.FC<InlineEditProps> = ({
  value,
  onSave,
  onReset,
  showResetButton = false,
  prefix = '$'
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(value.toString());

  const handleSave = () => {
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue >= 0) {
      onSave(numValue);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditValue(value.toString());
    setIsEditing(false);
  };

  const handleEdit = () => {
    setEditValue(value.toString());
    setIsEditing(true);
  };

  if (isEditing) {
    return (
      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          className="w-32"
          min="0"
          step="0.01"
        />
        <Button size="sm" variant="ghost" onClick={handleSave}>
          <Check className="h-4 w-4" />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleCancel}>
          <X className="h-4 w-4" />
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span>{prefix}{value.toFixed(2)}</span>
      <Button size="sm" variant="ghost" onClick={handleEdit}>
        <Pencil className="h-4 w-4" />
      </Button>
      {showResetButton && onReset && (
        <Button size="sm" variant="outline" onClick={onReset}>
          Reset to Auto
        </Button>
      )}
    </div>
  );
};
