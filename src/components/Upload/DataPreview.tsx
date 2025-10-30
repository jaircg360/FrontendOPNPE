import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useDataContext } from '@/contexts/DataContext';
import { FileSpreadsheet } from 'lucide-react';

const DataPreview = () => {
  const { csvData } = useDataContext();

  if (!csvData) return null;

  const previewRows = csvData.rows.slice(0, 10);

  return (
    <Card className="shadow-medium">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5 text-primary" />
            Vista Previa de Datos
          </CardTitle>
          <div className="flex gap-2">
            <Badge variant="outline">
              {csvData.headers.length} columnas
            </Badge>
            <Badge variant="outline">
              {csvData.rows.length} filas
            </Badge>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Archivo: {csvData.fileName}
        </p>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 bg-muted">#</TableHead>
                {csvData.headers.map((header, index) => (
                  <TableHead key={index} className="bg-muted font-semibold">
                    {header}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {previewRows.map((row, rowIndex) => (
                <TableRow key={rowIndex}>
                  <TableCell className="font-medium text-muted-foreground">
                    {rowIndex + 1}
                  </TableCell>
                  {row.map((cell, cellIndex) => (
                    <TableCell key={cellIndex}>{cell}</TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        {csvData.rows.length > 10 && (
          <p className="mt-4 text-center text-sm text-muted-foreground">
            Mostrando las primeras 10 filas de {csvData.rows.length} filas totales
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DataPreview;
