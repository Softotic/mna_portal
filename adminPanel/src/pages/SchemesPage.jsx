import { useCallback, useState, useEffect } from 'react';
import {
  Box,
  Card,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  LinearProgress,
  DialogContentText,
} from '@mui/material';
import { Add, Edit, Delete, Search } from '@mui/icons-material';
import { schemeCategoriesAPI, schemeTemplatesAPI } from '../api';
import { useAuth } from '../auth/AuthContext';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import AdminTablePagination from '../components/AdminTablePagination';
import PageHeader from '../components/PageHeader';
import InputAdornment from '@mui/material/InputAdornment';
import { useAdminFeedback } from '../feedback/AdminFeedbackContext';

export default function SchemesPage() {
  const { notify } = useAdminFeedback();
  const { category_slug } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const moduleKey = category_slug ? category_slug.toUpperCase() : 'SCHEMES';
  const canAdd = hasPermission(moduleKey, 'create');
  const canEdit = hasPermission(moduleKey, 'edit');
  const canDelete = hasPermission(moduleKey, 'delete');
  const canView = hasPermission(moduleKey, 'view');

  const [templates, setTemplates] = useState([]);
  const [categories, setCategories] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editTemplate, setEditTemplate] = useState(null);
  const [formData, setFormData] = useState({ title: '', category_slug: category_slug || '', field_definitions: [''] });

  const [deleteId, setDeleteId] = useState(null);

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const response = await schemeTemplatesAPI.list({
        category_slug: category_slug || undefined,
        search,
        page: page + 1,
        page_size: rowsPerPage,
      });
      setTemplates(response.data.results || response.data);
      setCount(response.data.count ?? (response.data.results ? response.data.count : response.data.length));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [category_slug, page, rowsPerPage, search]);

  const fetchCategories = useCallback(() => {
    schemeCategoriesAPI.list().then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    if (canView) fetchCategories();
  }, [canView, fetchCategories]);

  useEffect(() => {
    if (canView) fetchTemplates();
  }, [canView, fetchTemplates]);

  if (category_slug && !canView) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleOpen = (template = null) => {
    if (template) {
      setEditTemplate(template);
      setFormData({
        title: template.title,
        category_slug: template.category_slug,
        field_definitions: template.field_definitions.length ? template.field_definitions : [''],
      });
    } else {
      setEditTemplate(null);
      setFormData({ title: '', category_slug: category_slug || '', field_definitions: [''] });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditTemplate(null);
  };

  const handleFieldChange = (index, value) => {
    setFormData((prev) => {
      const updatedFields = [...prev.field_definitions];
      updatedFields[index] = value;
      return { ...prev, field_definitions: updatedFields };
    });
  };

  const handleAddField = () => {
    setFormData((prev) => ({
      ...prev,
      field_definitions: [...prev.field_definitions, ''],
    }));
  };

  const handleRemoveField = (index) => {
    setFormData((prev) => {
      const remaining = prev.field_definitions.filter((_, idx) => idx !== index);
      return {
        ...prev,
        field_definitions: remaining.length ? remaining : [''],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      category_slug: formData.category_slug || category_slug,
      field_definitions: formData.field_definitions.filter((field) => field.trim()),
    };

    try {
      if (editTemplate) {
        await schemeTemplatesAPI.update(editTemplate.id, payload);
      } else {
        await schemeTemplatesAPI.create(payload);
      }
      handleClose();
      fetchTemplates();
    } catch (err) {
      notify(err.response?.data?.detail || 'Unable to save the scheme template.', 'error');
    }
  };

  const handleDelete = async () => {
    try {
      await schemeTemplatesAPI.delete(deleteId);
      setDeleteId(null);
      fetchTemplates();
    } catch {
      notify('Unable to delete the scheme template.', 'error');
    }
  };

  return (
    <Box>
      <PageHeader
        title={category_slug ? `${category_slug.replace(/-/g, ' ')} schemes` : 'Scheme management'}
        description="Create scheme registers, define their fields, and open records for data entry."
        actions={canAdd ? (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add Scheme
          </Button>
        ) : null}
      />

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, flexWrap: 'wrap', borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search schemes..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
            sx={{ width: { xs: '100%', sm: 340 } }}
          />
          {category_slug ? (
            <Typography variant="body2" sx={{ pt: 1 }}>Category: {category_slug.toUpperCase()}</Typography>
          ) : null}
        </Box>

        {loading && <LinearProgress color="primary" />}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ fontWeight: 700 }}>Scheme Title</TableCell>
                {!category_slug && <TableCell sx={{ fontWeight: 700 }}>Category</TableCell>}
                <TableCell sx={{ fontWeight: 700 }}>Fields</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {templates.map((template, index) => (
                <TableRow key={template.id} hover>
                  <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                  <TableCell
                    sx={{ cursor: 'pointer' }}
                    onClick={() => navigate(`/schemes/${template.category_slug}/${template.id}`)}
                  >
                    <Typography variant="body2" fontWeight={500}>{template.title}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click to open the scheme and add actual data.
                    </Typography>
                  </TableCell>
                  {!category_slug && <TableCell>{template.category_name}</TableCell>}
                  <TableCell>{template.field_definitions?.length || 0}</TableCell>
                  <TableCell align="right">
                    {canEdit && (
                      <IconButton size="small" color="primary" onClick={() => handleOpen(template)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    )}
                    {canDelete && (
                      <IconButton size="small" color="error" onClick={() => setDeleteId(template.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && templates.length === 0 && (
                <TableRow>
                  <TableCell colSpan={category_slug ? 4 : 5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No scheme templates found</Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <AdminTablePagination
          count={count}
          page={page}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        />
      </Card>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editTemplate ? 'Edit Scheme Template' : 'Add New Scheme'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField
                label="Scheme Title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
              {!category_slug && (
                <TextField
                  select
                  label="Category"
                  value={formData.category_slug}
                  onChange={(e) => setFormData({ ...formData, category_slug: e.target.value })}
                  required
                >
                  {categories.map((category) => (
                    <MenuItem key={category.id} value={category.slug}>
                      {category.name}
                    </MenuItem>
                  ))}
                </TextField>
              )}

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>Fields</Typography>
                {formData.field_definitions.map((field, idx) => (
                  <Box key={idx} sx={{ display: 'flex', gap: 1, alignItems: 'center', mb: 1 }}>
                    <TextField
                      fullWidth
                      label={`Field ${idx + 1}`}
                      value={field}
                      onChange={(e) => handleFieldChange(idx, e.target.value)}
                    />
                    <Button
                      color="error"
                      onClick={() => handleRemoveField(idx)}
                      disabled={formData.field_definitions.length === 1}
                    >
                      Remove
                    </Button>
                  </Box>
                ))}
                <Button variant="outlined" onClick={handleAddField} startIcon={<Add />}>
                  Add Field
                </Button>
              </Box>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this scheme template? This action cannot be undone.
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
