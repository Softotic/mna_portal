import { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, LinearProgress, Switch,
} from '@mui/material';
import { Add, Edit, Check, Close, Delete } from '@mui/icons-material';
import { schemeCategoriesAPI } from '../api';
import { useAuth } from '../auth/AuthContext';

export default function CategoriesPage() {
  const { hasPermission } = useAuth();
  const canAdd = hasPermission('CATEGORIES', 'create');
  const canEdit = hasPermission('CATEGORIES', 'edit');
  const canDelete = hasPermission('CATEGORIES', 'delete');

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editCategory, setEditCategory] = useState(null);
  const [formData, setFormData] = useState({ name: '' });
  
  // Warning Dialog State for Soft Delete alternative
  const [warningOpen, setWarningOpen] = useState(false);
  const [warningCategory, setWarningCategory] = useState(null);
  const [warningMessage, setWarningMessage] = useState('');

  const fetchCategories = () => {
    setLoading(true);
    schemeCategoriesAPI.list()
      .then(res => setCategories(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpen = (category = null) => {
    if (category) {
      setEditCategory(category);
      setFormData({ name: category.name });
    } else {
      setEditCategory(null);
      setFormData({ name: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditCategory(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editCategory) {
        await schemeCategoriesAPI.update(editCategory.id, formData);
      } else {
        await schemeCategoriesAPI.create(formData);
      }
      handleClose();
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving category');
    }
  };

  const handleToggleActive = async (id, current_status) => {
    try {
      await schemeCategoriesAPI.update(id, { is_active: !current_status });
      fetchCategories();
    } catch (err) {
      alert('Error toggling active status');
    }
  };

  const handleDelete = async (id, category) => {
    if (window.confirm("Are you sure you want to permanently delete this category?")) {
      try {
        await schemeCategoriesAPI.delete(id);
        fetchCategories();
      } catch (err) {
        if (err.response?.status === 400 && err.response?.data?.message) {
          // Alert basic error
          alert('Error deleting category constraint');
        }
      }
    }
  };

  const handleDeactivateInstead = async () => {
    if (warningCategory) {
      await handleToggleActive(warningCategory.id, true);
      setWarningOpen(false);
      setWarningCategory(null);
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5" fontWeight={700}>Scheme Categories</Typography>
        {canAdd && (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Category
          </Button>
        )}
      </Box>

      <Card sx={{ borderRadius: 3 }}>
        {loading && <LinearProgress color="primary" />}
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Category Name</TableCell>
                <TableCell sx={{ fontWeight: 700 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categories.map((cat, index) => (
                <TableRow key={cat.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell fontWeight={500}>{cat.name}</TableCell>
                  <TableCell align="right">
                    {canEdit && (
                      <IconButton size="small" color="primary" onClick={() => handleOpen(cat)} sx={{ mr: 1 }}>
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" color="error" onClick={() => handleDelete(cat.id, cat)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No categories found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      {/* Edit/Create Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editCategory ? 'Edit Category' : 'Add New Category'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, pt: 1 }}>
              <TextField 
                label="Category Name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
                helperText="Name of the scheme category (e.g. Education)"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
      
      {/* Dependency Warning Dialog */}
      <Dialog open={warningOpen} onClose={() => setWarningOpen(false)}>
        <DialogTitle sx={{ color: 'error.main' }}>Action Denied</DialogTitle>
        <DialogContent>
          <Typography>{warningMessage}</Typography>
          <Typography sx={{ mt: 2 }} variant="body2" color="text.secondary">
            Since data depends on `{warningCategory?.name}`, standard operation is to deactivate it instead so it hides from new assignment dropdowns without breaking history.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWarningOpen(false)}>Cancel</Button>
          <Button onClick={handleDeactivateInstead} color="warning" variant="contained">
            Deactivate Category
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
