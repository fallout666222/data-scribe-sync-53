
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { TableInfo, fetchTables, fetchTableData } from '@/services/api';
import DataTable from '@/components/DataTable';
import ConnectionForm, { ConnectionSettings } from '@/components/ConnectionForm';
import NewRecordForm from '@/components/NewRecordForm';
import { Loader2 } from 'lucide-react';

const Index = () => {
  const { toast } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const [tables, setTables] = useState<TableInfo[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [tableData, setTableData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  
  const handleConnect = async (settings: ConnectionSettings) => {
    // In a real app, you would send these settings to the backend
    // For demo purposes, we're just pretending to connect
    setLoading(true);
    
    try {
      // Fetch available tables
      const tablesData = await fetchTables();
      setTables(tablesData);
      setIsConnected(true);
      
      toast({
        title: "Connected",
        description: `Successfully connected to database at ${settings.host}:${settings.port}`,
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Could not connect to the database",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };
  
  const loadTableData = async (tableName: string) => {
    setLoading(true);
    try {
      const data = await fetchTableData(tableName);
      setTableData(data);
    } catch (error) {
      console.error('Failed to load table data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleTableChange = (tableName: string) => {
    setSelectedTable(tableName);
    loadTableData(tableName);
  };
  
  const handleDataChange = () => {
    if (selectedTable) {
      loadTableData(selectedTable);
    }
  };
  
  // Get columns from the first record, used for creating new records
  const columns = tableData.length > 0 ? Object.keys(tableData[0]) : [];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">PostgreSQL Data Manager</h1>
      
      {!isConnected ? (
        <ConnectionForm onConnect={handleConnect} />
      ) : (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-xl">Database Tables</CardTitle>
            </CardHeader>
            <CardContent>
              <Select onValueChange={handleTableChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tables.map((table) => (
                    <SelectItem key={table.table_name} value={table.table_name}>
                      {table.table_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
          
          {selectedTable && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl flex items-center justify-between">
                    <span>Table: {selectedTable}</span>
                    {loading && <Loader2 className="animate-spin h-5 w-5" />}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {columns.length > 0 && (
                    <NewRecordForm 
                      tableName={selectedTable} 
                      columns={columns} 
                      onRecordCreated={handleDataChange} 
                    />
                  )}
                  
                  <DataTable 
                    data={tableData} 
                    tableName={selectedTable}
                    onDataChange={handleDataChange}
                  />
                </CardContent>
              </Card>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Index;
