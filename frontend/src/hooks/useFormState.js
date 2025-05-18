import { useState, useEffect, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useToast } from './use-toast';

export function useFormState({
  defaultValues = {},
  schema,
  onSubmit: onSubmitProp,
  onSuccess,
  onError,
  successMessage = 'Operation completed successfully',
  errorMessage = 'An error occurred. Please try again.',
}) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const methods = useForm({
    defaultValues,
    resolver: schema ? zodResolver(schema) : undefined,
  });

  const { reset, handleSubmit } = methods;

  // Reset form when defaultValues change
  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = useCallback(
    async (data) => {
      if (!onSubmitProp) return;
      
      setIsLoading(true);
      try {
        const result = await onSubmitProp(data);
        
        if (onSuccess) {
          onSuccess(result, data);
        } else if (successMessage) {
          toast({
            title: 'Success',
            description: successMessage,
            variant: 'success',
          });
        }
        
        return result;
      } catch (error) {
        console.error('Form submission error:', error);
        
        if (onError) {
          onError(error);
        } else {
          toast({
            title: 'Error',
            description: error?.message || errorMessage,
            variant: 'destructive',
          });
        }
        
        throw error;
      } finally {
        setIsLoading(false);
      }
    },
    [onSubmitProp, onSuccess, onError, successMessage, errorMessage, toast]
  );

  const submitForm = handleSubmit(onSubmit);

  return {
    ...methods,
    isLoading,
    submitForm,
    handleSubmit: submitForm,
  };
}

export function useFieldArrayState({
  control,
  name,
  defaultValue = [],
  keyName = 'id',
  generateKey = (index) => `${name}-${index}-${Date.now()}`,
}) {
  const [items, setItems] = useState(() => 
    defaultValue.map((item, index) => ({
      ...item,
      [keyName]: item[keyName] || generateKey(index),
    }))
  );

  const append = useCallback(
    (item) => {
      const newItem = {
        ...item,
        [keyName]: item[keyName] || generateKey(items.length),
      };
      setItems((prev) => [...prev, newItem]);
      return newItem;
    },
    [generateKey, items.length, keyName]
  );

  const update = useCallback(
    (index, updates) => {
      setItems((prev) =>
        prev.map((item, i) =>
          i === index ? { ...item, ...updates } : item
        )
      );
    },
    []
  );

  const remove = useCallback((index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const move = useCallback((fromIndex, toIndex) => {
    setItems((prev) => {
      const newItems = [...prev];
      const [movedItem] = newItems.splice(fromIndex, 1);
      newItems.splice(toIndex, 0, movedItem);
      return newItems;
    });
  }, []);

  const insert = useCallback(
    (index, item) => {
      const newItem = {
        ...item,
        [keyName]: item[keyName] || generateKey(items.length),
      };
      setItems((prev) => [
        ...prev.slice(0, index),
        newItem,
        ...prev.slice(index),
      ]);
      return newItem;
    },
    [generateKey, items.length, keyName]
  );

  const reset = useCallback((newItems = []) => {
    setItems(
      newItems.map((item, index) => ({
        ...item,
        [keyName]: item[keyName] || generateKey(index),
      }))
    );
  }, [generateKey, keyName]);

  // Sync with react-hook-form's field array if control is provided
  useEffect(() => {
    if (control && control._formValues) {
      control._setValue(name, items, { shouldDirty: true });
    }
  }, [control, items, name]);

  return {
    items,
    append,
    update,
    remove,
    move,
    insert,
    reset,
  };
}
