import * as React from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';

export function FileUpload({
  value = [],
  onChange,
  onUpload,
  multiple = false,
  maxFiles = 5,
  maxSize = 5 * 1024 * 1024, // 5MB
  accept = {
    'image/*': ['.jpeg', '.jpg', '.png', '.gif'],
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  },
  className,
  disabled = false,
  loading = false,
  uploadButtonText = 'Upload',
  dropzoneOptions = {},
}) {
  const [files, setFiles] = React.useState(value || []);
  const [uploading, setUploading] = React.useState(false);
  
  // Update internal state when value prop changes
  React.useEffect(() => {
    if (value) {
      setFiles(Array.isArray(value) ? value : [value]);
    }
  }, [value]);

  const onDrop = React.useCallback(
    (acceptedFiles, fileRejections) => {
      if (fileRejections?.length) {
        // Handle file rejections (e.g., file too large, wrong type)
        const errors = fileRejections.map(({ file, errors }) => ({
          file,
          errors: errors.map((e) => e.message),
        }));
        console.error('File rejected:', errors);
        // You might want to show a toast or alert here
        return;
      }

      const newFiles = multiple ? [...files, ...acceptedFiles] : [acceptedFiles[0]];
      
      if (onChange) {
        onChange(multiple ? newFiles : newFiles[0]);
      } else {
        setFiles(newFiles);
      }
      
      // If onUpload callback is provided, upload the files
      if (onUpload) {
        handleUpload(newFiles);
      }
    },
    [files, multiple, onChange, onUpload]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple,
    maxFiles,
    maxSize,
    accept,
    disabled: disabled || loading || uploading,
    ...dropzoneOptions,
  });

  const removeFile = (index) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    
    if (onChange) {
      onChange(multiple ? newFiles : newFiles[0] || null);
    } else {
      setFiles(newFiles);
    }
  };

  const handleUpload = async (filesToUpload) => {
    if (!onUpload) return;
    
    setUploading(true);
    try {
      await onUpload(multiple ? filesToUpload : filesToUpload[0]);
    } catch (error) {
      console.error('Upload failed:', error);
      // You might want to show a toast or alert here
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (file) => {
    const type = file.type || '';
    
    if (type.startsWith('image/')) {
      return (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="h-10 w-10 rounded-md object-cover"
        />
      );
    }
    
    return <FileText className="h-10 w-10 text-gray-400" />;
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50',
          disabled && 'opacity-50 cursor-not-allowed',
          (loading || uploading) && 'opacity-70 cursor-wait'
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2">
          <Upload className="h-8 w-8 text-muted-foreground" />
          <div>
            <p className="text-sm font-medium">
              {isDragActive
                ? 'Drop the files here'
                : 'Drag & drop files here, or click to select files'}
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {Object.entries(accept)
                .flatMap(([type, exts]) => exts.map(ext => ext.toUpperCase()))
                .join(', ')}
              {maxSize && ` (Max size: ${formatFileSize(maxSize)})`}
            </p>
          </div>
        </div>
      </div>

      {files.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Selected Files</h4>
          <div className="space-y-2">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${index}`}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center space-x-3">
                  {getFileIcon(file)}
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFile(index);
                  }}
                  disabled={disabled || loading || uploading}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Remove file</span>
                </Button>
              </div>
            ))}
          </div>
          
          {onUpload && (
            <div className="flex justify-end pt-2">
              <Button
                type="button"
                onClick={() => handleUpload(files)}
                disabled={disabled || loading || uploading || files.length === 0}
              >
                {uploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  uploadButtonText
                )}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Pre-configured image uploader
export function ImageUpload(props) {
  return (
    <FileUpload
      accept={{
        'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.svg'],
      }}
      {...props}
    />
  );
}

// Pre-configured document uploader
export function DocumentUpload(props) {
  return (
    <FileUpload
      accept={{
        'application/pdf': ['.pdf'],
        'application/msword': ['.doc'],
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
        'application/vnd.ms-excel': ['.xls'],
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
        'text/plain': ['.txt'],
      }}
      {...props}
    />
  );
}
