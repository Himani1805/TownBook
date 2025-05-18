# UI Components

A collection of reusable UI components built with React and Tailwind CSS.

## Installation

Make sure you have the required dependencies installed:

```bash
npm install @radix-ui/react-dialog @radix-ui/react-popover @radix-ui/react-select @radix-ui/react-tooltip react-dropzone date-fns @hookform/resolvers zod
```

## Components

### Alert

Display feedback messages with different variants (info, success, warning, error).

```jsx
import { Alert, InfoAlert, SuccessAlert, WarningAlert, ErrorAlert } from '@/components/ui/Alert';

// Basic usage
<Alert 
  title="Title" 
  message="This is an alert message" 
  variant="info" 
  showDismiss 
  onDismiss={() => {}} 
/>

// Pre-styled variants
<InfoAlert title="Info" message="This is an info alert" />
<SuccessAlert title="Success" message="Operation completed successfully" />
<WarningAlert title="Warning" message="This is a warning" />
<ErrorAlert title="Error" message="Something went wrong" />
```

### Modal

A responsive and accessible modal dialog.

```jsx
import { Modal, ModalTrigger, ModalContent, ModalHeader, ModalTitle, ModalDescription, ModalFooter } from '@/components/ui/Modal';

function Example() {
  const [isOpen, setIsOpen] = React.useState(false);
  
  return (
    <Modal open={isOpen} onOpenChange={setIsOpen}>
      <ModalTrigger asChild>
        <Button>Open Modal</Button>
      </ModalTrigger>
      <ModalContent>
        <ModalHeader>
          <ModalTitle>Modal Title</ModalTitle>
          <ModalDescription>
            This is a description of the modal content.
          </ModalDescription>
        </ModalHeader>
        <div className="py-4">
          <p>Modal content goes here.</p>
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
          <Button>Continue</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
```

### Tooltip

Show additional information on hover or focus.

```jsx
import { Tooltip, TooltipTrigger, TooltipContent, EnhancedTooltip } from '@/components/ui/Tooltip';

// Basic usage
<Tooltip>
  <TooltipTrigger>Hover me</TooltipTrigger>
  <TooltipContent>This is a tooltip</TooltipContent>
</Tooltip>

// Enhanced tooltip with simpler API
<EnhancedTooltip content="This is an enhanced tooltip">
  <Button>Hover me</Button>
</EnhancedTooltip>
```

### DataTable

A feature-rich table component with sorting, pagination, and filtering.

```jsx
import { DataTable } from '@/components/ui/DataTable';

const columns = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'role',
    header: 'Role',
  },
];

const data = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User' },
];

function UsersTable() {
  return (
    <DataTable
      columns={columns}
      data={data}
      searchPlaceholder="Search users..."
      searchColumn="name"
      showPagination
      showSearch
    />
  );
}
```

### DatePicker & TimePicker

Date and time selection components.

```jsx
import { DatePicker, DateRangePicker } from '@/components/ui/DatePicker';
import { TimePicker, TimeRangePicker } from '@/components/ui/TimePicker';

function DateTimeExample() {
  const [date, setDate] = React.useState();
  const [time, setTime] = React.useState();
  const [dateRange, setDateRange] = React.useState({ from: null, to: null });
  const [timeRange, setTimeRange] = React.useState({ start: null, end: null });
  
  return (
    <div className="space-y-4">
      <div>
        <label>Select a date:</label>
        <DatePicker value={date} onChange={setDate} />
      </div>
      
      <div>
        <label>Select a time:</label>
        <TimePicker value={time} onChange={setTime} />
      </div>
      
      <div>
        <label>Date range:</label>
        <DateRangePicker value={dateRange} onChange={setDateRange} />
      </div>
      
      <div>
        <label>Time range:</label>
        <TimeRangePicker value={timeRange} onChange={setTimeRange} />
      </div>
    </div>
  );
}
```

### FileUpload

File upload component with drag-and-drop support.

```jsx
import { FileUpload, ImageUpload, DocumentUpload } from '@/components/ui/FileUpload';

function UploadExample() {
  const [files, setFiles] = React.useState([]);
  const [images, setImages] = React.useState([]);
  const [documents, setDocuments] = React.useState([]);
  
  const handleUpload = async (uploadedFiles) => {
    // Handle file upload to server
    console.log('Uploading files:', uploadedFiles);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    return { success: true };
  };
  
  return (
    <div className="space-y-8">
      <div>
        <h3>File Upload</h3>
        <FileUpload 
          value={files} 
          onChange={setFiles} 
          onUpload={handleUpload}
          multiple 
        />
      </div>
      
      <div>
        <h3>Image Upload</h3>
        <ImageUpload 
          value={images} 
          onChange={setImages} 
          onUpload={handleUpload}
          multiple
          maxFiles={5}
        />
      </div>
      
      <div>
        <h3>Document Upload</h3>
        <DocumentUpload 
          value={documents} 
          onChange={setDocuments} 
          onUpload={handleUpload}
          multiple
          maxSize={10 * 1024 * 1024} // 10MB
        />
      </div>
    </div>
  );
}
```

## Hooks

### useLocalStorage & useSessionStorage

Persist state to localStorage or sessionStorage.

```jsx
import { useLocalStorage, useSessionStorage } from '@/hooks/useStorage';

function StorageExample() {
  const [name, setName, removeName] = useLocalStorage('name', 'Guest');
  const [theme, setTheme] = useSessionStorage('theme', 'light');
  
  return (
    <div>
      <div>
        <label>Name: </label>
        <input value={name} onChange={(e) => setName(e.target.value)} />
        <button onClick={removeName}>Clear</button>
      </div>
      
      <div>
        <label>Theme: </label>
        <select value={theme} onChange={(e) => setTheme(e.target.value)}>
          <option value="light">Light</option>
          <option value="dark">Dark</option>
        </select>
      </div>
    </div>
  );
}
```

### useMediaQuery

Respond to CSS media queries in React.

```jsx
import { 
  useMediaQuery, 
  useIsMobile, 
  useIsTablet, 
  useIsDesktop,
  useDarkMode 
} from '@/hooks/useMediaQuery';

function ResponsiveExample() {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();
  const isDarkMode = useDarkMode();
  const isSmallScreen = useMediaQuery('(max-width: 600px)');
  
  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <p>Device type: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</p>
      <p>Dark mode: {isDarkMode ? 'Yes' : 'No'}</p>
      <p>Small screen: {isSmallScreen ? 'Yes' : 'No'}</p>
    </div>
  );
}
```

### useFormState

Enhanced form state management with validation.

```jsx
import { useFormState } from '@/hooks/useFormState';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

function LoginForm() {
  const { register, handleSubmit, errors, isSubmitting } = useFormState({
    defaultValues: { email: '', password: '' },
    schema,
    onSubmit: async (data) => {
      // Handle form submission
      console.log('Form submitted:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return { success: true };
    },
    onSuccess: (result) => {
      console.log('Login successful', result);
    },
    onError: (error) => {
      console.error('Login error', error);
    },
  });
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Email</label>
        <input 
          {...register('email')} 
          type="email" 
          className={errors.email ? 'error' : ''}
        />
        {errors.email && <p className="error-message">{errors.email.message}</p>}
      </div>
      
      <div>
        <label>Password</label>
        <input 
          {...register('password')} 
          type="password" 
          className={errors.password ? 'error' : ''}
        />
        {errors.password && <p className="error-message">{errors.password.message}</p>}
      </div>
      
      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Logging in...' : 'Log in'}
      </button>
    </form>
  );
}
```

## Styling

All components are styled using Tailwind CSS. You can customize the styling by:

1. Using the `className` prop to add custom Tailwind classes
2. Using the `[data-*]` selectors to target specific component states
3. Extending the theme in your `tailwind.config.js` file

## Contributing

1. Fork the repository
2. Create a new branch for your feature
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

MIT
