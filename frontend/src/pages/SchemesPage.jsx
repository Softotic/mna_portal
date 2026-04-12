import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  LinearProgress, DialogContentText
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { schemeCategoriesAPI, schemesAPI } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useParams, Navigate } from 'react-router-dom';

const STATUS_COLORS = {
  pending: 'warning',
  approved: 'success',
  completed: 'info'
};

export default function SchemesPage() {
  const { slug: category_slug } = useParams();
  const { hasPermission } = useAuth();
  
  // Safely default to false if route hasn't loaded properly
  const moduleKey = category_slug ? category_slug.toUpperCase() : '';
  const canAdd = hasPermission(moduleKey, 'create');
  const canEdit = hasPermission(moduleKey, 'edit');
  const canDelete = hasPermission(moduleKey, 'delete');
  const canView = hasPermission(moduleKey, 'view');

  if (category_slug && !canView) {
    return <Navigate to="/dashboard" replace />;
  }

  const [schemes, setSchemes] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editScheme, setEditScheme] = useState(null);
  const [formData, setFormData] = useState({ title: '', description: '', category_slug: '', budget: '', status: 'pending' });

  const [deleteId, setDeleteId] = useState(null);

  const fetchSchemes = () => {
    setLoading(true);
    schemesAPI.list({
      category_slug,
      search,
      status: statusFilter,
      page: page + 1,
      page_size: rowsPerPage,
    })
      .then(res => {
        setSchemes(res.data.results);
        setCount(res.data.count);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const fetchCategories = () => {
    schemeCategoriesAPI.list().then(res => setCategories(res.data));
  };

  useEffect(() => {
    if (category_slug) fetchSchemes();
  }, [page, rowsPerPage, search, statusFilter, category_slug]);

  useEffect(() => {
    if (canAdd || canEdit) fetchCategories();
  }, [canAdd, canEdit]);

  const handleOpen = (scheme = null) => {
    if (scheme) {
      setEditScheme(scheme);
      setFormData({ 
        title: scheme.title, 
        description: scheme.description, 
        category_slug: category_slug, 
        budget: scheme.budget,
        status: scheme.status 
      });
    } else {
      setEditScheme(null);
      setFormData({ title: '', description: '', category_slug: category_slug, budget: '', status: 'pending' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditScheme(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editScheme) {
        await schemesAPI.update(editScheme.id, formData);
      } else {
        await schemesAPI.create(formData);
      }
      handleClose();
      fetchSchemes();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving scheme');
    }
  };

  const handleDelete = async () => {
    try {
      await schemesAPI.delete(deleteId);
      setDeleteId(null);
      fetchSchemes();
    } catch (err) {
      alert('Error deleting scheme');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700}>Schemes Management</Typography>
        {canAdd && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Scheme
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search schemes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{ width: 300 }}
          />
          <TextField
            select
            size="small"
            label="Filter Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ width: 150 }}
          >
            <MenuItem value="">All Statuses</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="completed">Completed</MenuItem>
          </TextField>
        </Box>
        
        {loading && <LinearProgress color="primary" />}
        
        <TableContainer>
          <Table sx={{ minWidth: 800 }}>
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Budget (Rs)</TableCell>
                <TableCell>Added By</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {schemes.map((row) => (
                <TableRow key={row.id}>
                  <TableCell>
                    <Typography variant="body2" fontWeight={500}>{row.title}</Typography>
                    <Typography variant="caption" color="text.secondary" noWrap sx={{ maxWidth: 250, display: 'block' }}>
                      {row.description}
                    </Typography>
                  </TableCell>
                  <TableCell>{parseFloat(row.budget).toLocaleString()}</TableCell>
                  <TableCell>{row.created_by_name}</TableCell>
                  <TableCell>
                    <Chip size="small" label={row.status.toUpperCase()} color={STATUS_COLORS[row.status] || 'default'} />
                  </TableCell>
                  <TableCell align="right">
                    {canEdit && (
                      <IconButton size="small" color="primary" onClick={() => handleOpen(row)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" color="error" onClick={() => setDeleteId(row.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && schemes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No schemes found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={count}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editScheme ? 'Edit Scheme' : 'Add New Scheme'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField 
                label="Scheme Title" 
                value={formData.title} 
                onChange={(e) => setFormData({...formData, title: e.target.value})} 
                required 
              />
              <TextField 
                label="Budget (PKR)" 
                type="number"
                value={formData.budget} 
                onChange={(e) => setFormData({...formData, budget: e.target.value})} 
                required 
              />
              <TextField 
                label="Description" 
                multiline
                rows={3}
                value={formData.description} 
                onChange={(e) => setFormData({...formData, description: e.target.value})} 
              />
              {editScheme && (
                <TextField 
                  select 
                  label="Status" 
                  value={formData.status} 
                  onChange={(e) => setFormData({...formData, status: e.target.value})} 
                  required
                >
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="approved">Approved</MenuItem>
                  <MenuItem value="completed">Completed</MenuItem>
                </TextField>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save Scheme</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this scheme? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)}>Cancel</Button>
          <Button onClick={handleDelete} color="error" variant="contained">Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
