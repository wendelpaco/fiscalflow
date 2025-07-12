# **App Name**: FiscalFlow

## Core Features:

- Job Creation Screen: Create Job Screen with URL input (required) and Webhook URL input (optional) fields.
- Job Creation Buttons: Job Creation Screen to include 'Send to Queue' button to create the job, and 'Create Mass Jobs' button to process multiple pre-defined URLs.
- Loading Indicator: Job Creation Screen with loading indicator during submission.
- Job Visualization Screen: Job Visualization Screen showing list of all created jobs with status (PENDING, PROCESSING, DONE, ERROR), ID, URL, creation date and processing duration.
- Job Details and Refresh: Job Visualization Screen with buttons to view complete job details and refresh the list.
- NFC-e Details Extraction and Display: AI tool that extracts and displays company information (name, CNPJ), invoice data (number, series, date of issue, protocol), item list (name, code, quantity, unit price, total price) and totals (total quantity, total value, payment method) from the Nota Fiscal.
- API Communication: Calls the API with the url and authentication to submit the job to the queue.

## Style Guidelines:

- Primary color: Dark Blue (#30475E) for a professional and calm feel.
- Background color: Light Gray (#F0F4F8) for a clean interface.
- Accent color: Green (#6A8E64) for success states, and subtle contrast.
- Body and headline font: 'Inter' sans-serif for a modern, machined and neutral look, appropriate for data-heavy interfaces.
- Use flat, outline-style icons for job statuses (pending, processing, done, error).
- Responsive layout that adapts to desktop and mobile devices, ensuring a consistent user experience across different screen sizes.
- Subtle animations for visual feedback (e.g., loading spinners, confirmation messages).