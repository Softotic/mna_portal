import { useCallback, useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Chip,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, MenuItem,
  LinearProgress, Switch,
} from '@mui/material';
import { Add, Edit, Check, Close, Search } from '@mui/icons-material';
import { usersAPI, rolesAPI } from '../api';
import { useAuth } from '../auth/AuthContext';
import AdminTablePagination from '../components/AdminTablePagination';
import PageHeader from '../components/PageHeader';
import InputAdornment from '@mui/material/InputAdornment';

export default function UsersPage() {
  const { hasPermission } = useAuth();
  const canAdd = hasPermission('USERS', 'create');
  const canEdit = hasPermission('USERS', 'edit');

  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [count, setCount] = useState(0);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', role_id: '', password: '' });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await usersAPI.list({ page: page + 1, page_size: rowsPerPage, search });
      setUsers(response.data.results);
      setCount(response.data.count);
    } finally {
      setLoading(false);
    }
  }, [page, rowsPerPage, search]);

  const fetchRoles = useCallback(() => {
    rolesAPI.getAllRoles().then(res => setRoles(res.data));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (canAdd || canEdit) fetchRoles();
  }, [canAdd, canEdit, fetchRoles]);

  const handleOpen = (user = null) => {
    if (user) {
      setEditUser(user);
      setFormData({ name: user.name, email: user.email, role_id: user.role_detail?.id || '', password: '' });
    } else {
      setEditUser(null);
      setFormData({ name: '', email: '', role_id: '', password: '' });
    }
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setEditUser(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      if (!payload.password) delete payload.password;
      
      if (editUser) {
        await usersAPI.update(editUser.id, payload);
      } else {
        await usersAPI.create(payload);
      }
      handleClose();
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving user');
    }
  };

  const handleToggleActive = async (id) => {
    try {
      await usersAPI.toggleActive(id);
      fetchUsers();
    } catch {
      alert('Error toggling active status');
    }
  };

  return (
    <Box>
      <PageHeader
        title="Users"
        description="Manage administrator accounts, assigned roles, and access status."
        actions={canAdd ? (
          <Button variant="contained" startIcon={<Add />} onClick={() => handleOpen()}>
            Add User
          </Button>
        ) : null}
      />

      <Card sx={{ borderRadius: 3 }}>
        <Box sx={{ p: 2, display: 'flex', gap: 2, borderBottom: '1px solid', borderColor: 'divider' }}>
          <TextField
            size="small"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            slotProps={{ input: { startAdornment: <InputAdornment position="start"><Search fontSize="small" /></InputAdornment> } }}
            sx={{ width: { xs: '100%', sm: 340 } }}
          />
        </Box>
        
        {loading && <LinearProgress color="primary" />}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell fontWeight={500}>{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <Chip size="small" label={user.role_detail?.name || 'Superadmin'} color="primary" variant="outlined" />
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={user.is_active ? 'Active' : 'Inactive'} 
                      color={user.is_active ? 'success' : 'error'}
                      icon={user.is_active ? <Check fontSize="small"/> : <Close fontSize="small"/>}
                    />
                  </TableCell>
                  <TableCell align="right">
                    {canEdit && !user.is_staff && (
                      <>
                        <Switch
                          size="small"
                          checked={user.is_active}
                          onChange={() => handleToggleActive(user.id)}
                          color="success"
                        />
                        <IconButton size="small" color="primary" onClick={() => handleOpen(user)}>
                          <Edit fontSize="small" />
                        </IconButton>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {!loading && users.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <Typography color="text.secondary">No users found</Typography>
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
          <DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
              <TextField 
                label="Full Name" 
                value={formData.name} 
                onChange={(e) => setFormData({...formData, name: e.target.value})} 
                required 
              />
              <TextField 
                label="Email Address" 
                type="email" 
                value={formData.email} 
                onChange={(e) => setFormData({...formData, email: e.target.value})} 
                required 
                disabled={!!editUser}
              />
              <TextField 
                select 
                label="Role" 
                value={formData.role_id} 
                onChange={(e) => setFormData({...formData, role_id: e.target.value})} 
                required
              >
                {roles.map(r => (
                  <MenuItem key={r.id} value={r.id}>{r.name}</MenuItem>
                ))}
              </TextField>
              <TextField 
                label="Password" 
                type="password" 
                value={formData.password} 
                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                required={!editUser}
                helperText={editUser ? "Leave blank to keep current password" : "Minimum 8 characters"}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Cancel</Button>
            <Button type="submit" variant="contained">Save</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
