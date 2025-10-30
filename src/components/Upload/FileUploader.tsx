import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileSpreadsheet, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDataContext } from '@/contexts/DataContext';
import { useToast } from '@/hooks/use-toast';
import { dataAPI } from '@/lib/api';

const FileUploader = () => {
  const { setCSVData } = useDataContext();
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return;

      const file = acceptedFiles[0];
      setIsUploading(true);

      try {
        const response = await dataAPI.uploadCSV(file);

        setCSVData({
          headers: response.headers,
          rows: response.rows,
          fileName: response.filename,
        });

        toast({
          title: 'Archivo cargado',
          description: `${response.filename} se ha cargado correctamente con ${response.headers.length} columnas y ${response.row_count} filas.`,
        });
      } catch (error: any) {
        const errorMessage = error.response?.data?.detail || error.message || 'Error al cargar el archivo';
        toast({
          title: 'Error al procesar archivo',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsUploading(false);
      }
    },
    [setCSVData, toast]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv'],
    },
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        'cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-all',
        isUploading && 'pointer-events-none opacity-60',
        isDragActive
          ? 'border-primary bg-accent'
          : 'border-border bg-card hover:border-primary hover:bg-accent/50'
      )}
    >
      <input {...getInputProps()} disabled={isUploading} />
      <div className="flex flex-col items-center gap-4">
        {isUploading ? (
          <Loader2 className="h-16 w-16 animate-spin text-primary" />
        ) : isDragActive ? (
          <FileSpreadsheet className="h-16 w-16 text-primary" />
        ) : (
          <Upload className="h-16 w-16 text-muted-foreground" />
        )}
        <div>
          <p className="mb-2 text-lg font-semibold text-foreground">
            {isUploading
              ? 'Subiendo archivo...'
              : isDragActive
              ? 'Suelte el archivo aquí'
              : 'Arrastre su archivo CSV aquí'}
          </p>
          <p className="text-sm text-muted-foreground">
            {!isUploading && 'o haga clic para seleccionar un archivo'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileUploader;
