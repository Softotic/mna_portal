import { useState, useEffect } from 'react';
import { 
  Box, Typography, Button, Paper, Table, TableBody, TableCell, TableContainer, 
  TableHead, TableRow, IconButton, Dialog, DialogTitle, DialogContent, 
  DialogActions, TextField, Checkbox, FormControlLabel, CircularProgress, Alert, Chip
} from '@mui/material';
import { Add, Edit, Delete } from '@mui/icons-material';
import { useAuth } from '../auth/AuthContext';
import { rolesAPI } from '../api';
import AdminTablePagination from '../components/AdminTablePagination';
import PageHeader from '../components/PageHeader';

export default function RolesPage() {
  const { hasPermission } = useAuth();
  
  const [roles, setRoles] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Dialog State
  const [open, setOpen] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [formData, setFormData] = useState({ name: '', description: '', permissions: {} });
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const currentPage = Math.min(page, Math.max(0, Math.ceil(roles.length / rowsPerPage) - 1));
  const visibleRoles = roles.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesRes, modulesRes] = await Promise.all([
        rolesAPI.getAllRoles(),
        rolesAPI.getModules()
      ]);
      setRoles(rolesRes.data);
      setModules(modulesRes.data);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to fetch roles data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpen = (role = null) => {
    setError(null);
    if (role) {
      // Map existing permissions to matrix format
      const permMap = {};
      role.permissions.forEach(p => {
        permMap[p.module_key] = {
          module_id: p.module_id,
          can_view: p.can_view,
          can_create: p.can_create,
          can_edit: p.can_edit,
          can_delete: p.can_delete
        };
      });
      setFormData({ name: role.name, description: role.description, permissions: permMap });
      setEditingRole(role);
    } else {
      setFormData({ name: '', description: '', permissions: {} });
      setEditingRole(null);
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRole(null);
  };

  const handlePermissionChange = (module, action, checked) => {
    setFormData(prev => {
      const current = prev.permissions[module.key] || { module_id: module.id, can_view: false, can_create: false, can_edit: false, can_delete: false };
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [module.key]: {
            ...current,
            [action]: checked
          }
        }
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    
    // Convert permissions map to array format for backend
    const permissions_data = Object.values(formData.permissions);
    
    // Validation: At least one permission must be active
    const hasAnyPerm = permissions_data.some(p => p.can_view || p.can_create || p.can_edit || p.can_delete);
    if (!hasAnyPerm && formData.name !== 'Super Admin') {
      setError('At least one permission must be selected.');
      setSaving(false);
      return;
    }

    try {
      const payload = {
        name: formData.name,
        description: formData.description,
        permissions_data
      };
      
      if (editingRole) {
        await rolesAPI.updateRole(editingRole.id, payload);
      } else {
        await rolesAPI.createRole(payload);
      }
      handleClose();
      fetchData();
    } catch (err) {
      setError(err.response?.data?.name?.[0] || 'Error saving role');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this role?')) return;
    try {
      await rolesAPI.deleteRole(id);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete role');
    }
  };

  if (loading && roles.length === 0) return <CircularProgress sx={{ display: 'block', mx: 'auto', mt: 4 }} />;

  return (
    <Box>
      <PageHeader
        title="Roles"
        description="Control what each administrator role can view, create, edit, and delete."
        actions={hasPermission('ROLES', 'create') ? (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Create Role
          </Button>
        ) : null}
      />

      {error && !open && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

      <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 2, border: '1px solid #e0e0e0' }}>
        <Table>
          <TableHead sx={{ bgcolor: 'grey.50' }}>
            <TableRow>
              <TableCell>Role Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Assigned Users</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {visibleRoles.map(role => (
              <TableRow key={role.id}>
                <TableCell sx={{ fontWeight: 600 }}>{role.name}</TableCell>
                <TableCell>{role.description}</TableCell>
                <TableCell>
                  <Chip label={`${role.user_count || 0} users`} size="small" color={role.user_count > 0 ? "primary" : "default"} />
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleOpen(role)} disabled={!hasPermission('ROLES', 'edit')} color="primary">
                    <Edit fontSize="small" />
                  </IconButton>
                  <IconButton 
                    onClick={() => handleDelete(role.id)} 
                    disabled={!hasPermission('ROLES', 'delete') || role.user_count > 0 || role.name === 'Super Admin'} 
                    color="error"
                  >
                    <Delete fontSize="small" />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <AdminTablePagination
          count={roles.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        />
      </TableContainer>

      {/* Create / Edit Dialog */}
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>{editingRole ? 'Edit Role' : 'Create Role'}</DialogTitle>
          <DialogContent dividers>
            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
            
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <TextField
                label="Role Name"
                fullWidth
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                disabled={editingRole?.name === 'Super Admin'}
              />
              <TextField
                label="Description"
                fullWidth
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </Box>

            <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1 }}>Permissions Matrix</Typography>
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead sx={{ bgcolor: 'grey.50' }}>
                  <TableRow>
                    <TableCell>Module</TableCell>
                    <TableCell align="center">View</TableCell>
                    <TableCell align="center">Create</TableCell>
                    <TableCell align="center">Edit</TableCell>
                    <TableCell align="center">Delete</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {modules.map(mod => {
                    const currentPerms = formData.permissions[mod.key] || {};
                    const isSuperAdmin = formData.name === 'Super Admin';
                    return (
                      <TableRow key={mod.key}>
                        <TableCell sx={{ fontWeight: 500 }}>{mod.name}</TableCell>
                        {['can_view', 'can_create', 'can_edit', 'can_delete'].map(action => (
                          <TableCell key={action} align="center">
                            <Checkbox 
                              checked={isSuperAdmin ? true : !!currentPerms[action]}
                              onChange={(e) => handlePermissionChange(mod, action, e.target.checked)}
                              disabled={isSuperAdmin}
                              color="primary"
                            />
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Saving...' : 'Save Role'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </Box>
  );
}
