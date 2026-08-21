import { useCallback, useEffect, useState } from 'react';
import {
  Box, Button, Card, Dialog, DialogActions, DialogContent, DialogTitle,
  IconButton, LinearProgress, Table, TableBody, TableCell, TableContainer,
  TableHead, TableRow, TextField, Typography,
} from '@mui/material';
import { Add, Delete, Edit, LocationCityOutlined } from '@mui/icons-material';
import { unionCouncilsAPI } from '../api';
import { useAuth } from '../auth/AuthContext';
import AdminTablePagination from '../components/AdminTablePagination';
import PageHeader from '../components/PageHeader';
import { useAdminFeedback } from '../feedback/AdminFeedbackContext';

export default function UnionCouncilsPage() {
  const { hasPermission } = useAuth();
  const { confirm, notify } = useAdminFeedback();
  const canCreate = hasPermission('UNION_COUNCILS', 'create');
  const canEdit = hasPermission('UNION_COUNCILS', 'edit');
  const canDelete = hasPermission('UNION_COUNCILS', 'delete');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [name, setName] = useState('');
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const response = await unionCouncilsAPI.list();
      setItems(response.data.results || response.data);
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to load Union Councils.', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => { load(); }, [load]);

  const openDialog = (item = null) => {
    setEditing(item);
    setName(item?.name || '');
    setDialogOpen(true);
  };

  const save = async (event) => {
    event.preventDefault();
    setSaving(true);
    try {
      if (editing) await unionCouncilsAPI.update(editing.id, { name: name.trim() });
      else await unionCouncilsAPI.create({ name: name.trim() });
      setDialogOpen(false);
      await load();
      notify(`Union Council ${editing ? 'updated' : 'added'} successfully.`, 'success');
    } catch (error) {
      notify(error.response?.data?.name?.[0] || error.response?.data?.detail || 'Unable to save Union Council.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const remove = async (item) => {
    const approved = await confirm({
      title: 'Delete Union Council?',
      description: 'Union Councils already used by scheme records cannot be deleted.',
      itemName: item.name,
      confirmLabel: 'Delete Union Council',
    });
    if (!approved) return;
    try {
      await unionCouncilsAPI.delete(item.id);
      await load();
      notify('Union Council deleted.', 'success');
    } catch (error) {
      notify(error.response?.data?.detail || 'Unable to delete Union Council.', 'error');
    }
  };

  const currentPage = Math.min(page, Math.max(0, Math.ceil(items.length / rowsPerPage) - 1));
  const visibleItems = items.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  return (
    <Box>
      <PageHeader
        title="Union Councils"
        description="Maintain the Union Council names available when entering scheme records."
        actions={canCreate ? <Button variant="contained" startIcon={<Add />} onClick={() => openDialog()}>Add Union Council</Button> : null}
      />
      <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer>
          <Table>
            <TableHead><TableRow><TableCell>#</TableCell><TableCell>Union Council Name</TableCell><TableCell align="right">Actions</TableCell></TableRow></TableHead>
            <TableBody>
              {visibleItems.map((item, index) => (
                <TableRow key={item.id} hover>
                  <TableCell>{currentPage * rowsPerPage + index + 1}</TableCell>
                  <TableCell><Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}><LocationCityOutlined color="action" fontSize="small" /><Typography fontWeight={600}>{item.name}</Typography></Box></TableCell>
                  <TableCell align="right">
                    {canEdit && <IconButton aria-label={`Edit ${item.name}`} color="primary" size="small" onClick={() => openDialog(item)}><Edit fontSize="small" /></IconButton>}
                    {canDelete && <IconButton aria-label={`Delete ${item.name}`} color="error" size="small" onClick={() => remove(item)}><Delete fontSize="small" /></IconButton>}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && items.length === 0 && <TableRow><TableCell colSpan={3} align="center" sx={{ py: 6 }}><Typography color="text.secondary">No Union Councils added yet.</Typography></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <AdminTablePagination count={items.length} page={currentPage} rowsPerPage={rowsPerPage} onPageChange={setPage} onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }} />
      </Card>
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <Box component="form" onSubmit={save}>
          <DialogTitle>{editing ? 'Edit Union Council' : 'Add Union Council'}</DialogTitle>
          <DialogContent dividers><TextField autoFocus fullWidth required label="Union Council Name" value={name} onChange={(event) => setName(event.target.value)} helperText="Only the name is stored and used in scheme records." /></DialogContent>
          <DialogActions><Button onClick={() => setDialogOpen(false)}>Cancel</Button><Button type="submit" variant="contained" disabled={saving || !name.trim()}>{saving ? 'Saving…' : 'Save'}</Button></DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
}
