import { useEffect, useState } from 'react';
import { getTableNames, getTableSchema, getTableRecords, createTableRecord, updateTableRecord, deleteTableRecord } from '../api';
import toast from 'react-hot-toast';

interface Column {
  cid: number;
  name: string;
  type: string;
  notnull: number;
  dflt_value: any;
  pk: number;
}

export default function Database() {
  const [tables, setTables] = useState<string[]>([]);
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [schema, setSchema] = useState<Column[]>([]);
  const [records, setRecords] = useState<any[]>([]);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    loadTables();
  }, []);

  async function loadTables() {
    try {
      const tableNames = await getTableNames();
      setTables(tableNames);
    } catch (error) {
      toast.error('Failed to load tables');
      console.error(error);
    }
  }

  async function loadTableData(tableName: string) {
    try {
      const [schemaData, recordsData] = await Promise.all([
        getTableSchema(tableName),
        getTableRecords(tableName)
      ]);
      setSchema(schemaData);
      setRecords(recordsData);
      setSelectedTable(tableName);
      setEditingRecord(null);
      setIsCreating(false);
    } catch (error) {
      toast.error('Failed to load table data');
      console.error(error);
    }
  }

  async function handleDelete(id: number) {
    if (!selectedTable) return;
    if (!confirm('Are you sure you want to delete this record?')) return;
    
    try {
      await deleteTableRecord(selectedTable, id);
      toast.success('Record deleted');
      loadTableData(selectedTable);
    } catch (error) {
      toast.error('Failed to delete record');
      console.error(error);
    }
  }

  async function handleSave() {
    if (!selectedTable || !editingRecord) return;
    
    try {
      if (isCreating) {
        await createTableRecord(selectedTable, editingRecord);
        toast.success('Record created');
      } else {
        await updateTableRecord(selectedTable, editingRecord.id, editingRecord);
        toast.success('Record updated');
      }
      loadTableData(selectedTable);
    } catch (error) {
      toast.error(isCreating ? 'Failed to create record' : 'Failed to update record');
      console.error(error);
    }
  }

  function startCreate() {
    const newRecord: any = {};
    schema.filter(col => col.name !== 'id').forEach(col => {
      newRecord[col.name] = col.dflt_value ?? '';
    });
    setEditingRecord(newRecord);
    setIsCreating(true);
  }

  function startEdit(record: any) {
    setEditingRecord({ ...record });
    setIsCreating(false);
  }

  function cancelEdit() {
    setEditingRecord(null);
    setIsCreating(false);
  }

  function updateField(field: string, value: any) {
    if (!editingRecord) return;
    setEditingRecord({ ...editingRecord, [field]: value });
  }

  const displayColumns = schema.filter(col => col.name !== 'id');
  const hasId = schema.some(col => col.name === 'id');

  return (
    <div className="content-page">
      <div className="content-header">
        <h1 className="content-title">Database Admin</h1>
        <p className="content-subtitle">View and manage database tables directly</p>
      </div>

      <div style={{ marginBottom: 20 }}>
        <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>
          Select Table:
        </label>
        <select 
          value={selectedTable || ''} 
          onChange={(e) => loadTableData(e.target.value)}
          style={{ padding: '8px 12px', fontSize: 14, minWidth: 200, borderRadius: 4 }}
        >
          <option value="">-- Choose a table --</option>
          {tables.map(table => (
            <option key={table} value={table}>{table}</option>
          ))}
        </select>
      </div>

      {selectedTable && (
        <>
          <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong style={{ fontSize: 18 }}>{selectedTable}</strong>
              <span style={{ marginLeft: 12, color: '#666', fontSize: 14 }}>
                {records.length} record{records.length !== 1 ? 's' : ''}
              </span>
            </div>
            <button onClick={startCreate} style={{ fontSize: 13 }}>+ Add Record</button>
          </div>

          {editingRecord && (
            <div style={{ 
              background: '#f8f9fa', 
              padding: 20, 
              borderRadius: 8, 
              marginBottom: 20,
              border: '2px solid #0066cc'
            }}>
              <h3 style={{ marginTop: 0, marginBottom: 16 }}>
                {isCreating ? 'Create New Record' : `Edit Record ${editingRecord.id}`}
              </h3>
              <div style={{ display: 'grid', gap: 12 }}>
                {displayColumns.map(col => (
                  <label key={col.name} style={{ display: 'block' }}>
                    <div style={{ fontWeight: 500, marginBottom: 4, fontSize: 13 }}>
                      {col.name}
                      {col.notnull ? ' *' : ''}
                      <span style={{ color: '#666', fontSize: 12, marginLeft: 8 }}>({col.type})</span>
                    </div>
                    {col.type.includes('TEXT') && col.name !== 'bullets' && col.name !== 'contact' && col.name !== 'socials' ? (
                      <input
                        type="text"
                        value={editingRecord[col.name] ?? ''}
                        onChange={(e) => updateField(col.name, e.target.value)}
                        style={{ width: '100%' }}
                      />
                    ) : (
                      <textarea
                        rows={3}
                        value={editingRecord[col.name] ?? ''}
                        onChange={(e) => updateField(col.name, e.target.value)}
                        style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
                      />
                    )}
                  </label>
                ))}
              </div>
              <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
                <button onClick={handleSave} style={{ background: '#0066cc', color: 'white' }}>
                  {isCreating ? 'Create' : 'Save Changes'}
                </button>
                <button onClick={cancelEdit} style={{ background: '#666', color: 'white' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ 
            background: 'white', 
            borderRadius: 8, 
            border: '1px solid #e1e4e8',
            overflowX: 'auto'
          }}>
            <table style={{ 
              width: '100%', 
              borderCollapse: 'collapse',
              fontSize: 13
            }}>
              <thead>
                <tr style={{ background: '#f6f8fa', borderBottom: '2px solid #e1e4e8' }}>
                  {hasId && <th style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>ID</th>}
                  {displayColumns.map(col => (
                    <th key={col.name} style={{ padding: '12px 8px', textAlign: 'left', fontWeight: 600 }}>
                      {col.name}
                    </th>
                  ))}
                  <th style={{ padding: '12px 8px', textAlign: 'right', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.length === 0 ? (
                  <tr>
                    <td 
                      colSpan={displayColumns.length + (hasId ? 2 : 1)} 
                      style={{ padding: 40, textAlign: 'center', color: '#888' }}
                    >
                      No records found
                    </td>
                  </tr>
                ) : (
                  records.map((record) => (
                    <tr 
                      key={record.id} 
                      style={{ 
                        borderBottom: '1px solid #e1e4e8',
                        background: editingRecord?.id === record.id ? '#fff9e6' : 'transparent'
                      }}
                    >
                      {hasId && (
                        <td style={{ padding: '8px', fontWeight: 500, color: '#0066cc' }}>
                          {record.id}
                        </td>
                      )}
                      {displayColumns.map(col => (
                        <td key={col.name} style={{ padding: '8px', maxWidth: 300 }}>
                          <div style={{ 
                            overflow: 'hidden', 
                            textOverflow: 'ellipsis',
                            whiteSpace: col.type.includes('TEXT') ? 'nowrap' : 'normal'
                          }}>
                            {record[col.name] === null ? (
                              <span style={{ color: '#999', fontStyle: 'italic' }}>NULL</span>
                            ) : (
                              String(record[col.name])
                            )}
                          </div>
                        </td>
                      ))}
                      <td style={{ padding: '8px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 4, justifyContent: 'flex-end' }}>
                          <button 
                            onClick={() => startEdit(record)}
                            style={{ fontSize: 12, padding: '4px 8px' }}
                          >
                            Edit
                          </button>
                          <button 
                            onClick={() => handleDelete(record.id)}
                            className="danger"
                            style={{ fontSize: 12, padding: '4px 8px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
