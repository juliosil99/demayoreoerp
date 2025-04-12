
import React from "react";
import { Form } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { TypeSelector } from "./TypeSelector";
import { CategoryField } from "./CategoryField";
import { AmountField } from "./AmountField";
import { DescriptionField } from "./DescriptionField";
import { SourceField } from "./SourceField";
import { RecurringToggle } from "./RecurringToggle";
import { FormFooter } from "./FormFooter";
import { ItemFormValues } from "./types";

interface ItemFormProps {
  form: UseFormReturn<ItemFormValues>;
  onSubmit: (values: ItemFormValues) => void;
  onCancel: () => void;
  isEditing: boolean;
}

export function ItemForm({ form, onSubmit, onCancel, isEditing }: ItemFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
        <TypeSelector form={form} />
        <CategoryField form={form} />
        <AmountField form={form} />
        <DescriptionField form={form} />
        
        <div className="grid grid-cols-2 gap-4">
          <SourceField form={form} />
          <RecurringToggle form={form} />
        </div>
        
        <FormFooter onCancel={onCancel} isEditing={isEditing} />
      </form>
    </Form>
  );
}
