import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  InputAdornment,
  LinearProgress,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { Add, Delete, Edit, KeyboardArrowDown, KeyboardArrowUp, Search } from '@mui/icons-material';
import { teamMembersAPI } from '../api/index.js';
import AdminTablePagination from '../components/AdminTablePagination.jsx';
import { useAdminFeedback } from '../feedback/AdminFeedbackContext.jsx';

const defaultForm = {
  name: '',
  photo: null,
  designation: '',
  email: '',
  phone: '',
  union_council: '',
  department: '',
  bio: '',
  status: 'published',
};

function formatApiError(data) {
  if (!data) return 'Unable to save team member.';
  if (typeof data === 'string') return data;
  if (data.detail) return data.detail;

  return Object.entries(data)
    .map(([field, value]) => {
      const message = Array.isArray(value) ? value.join(' ') : String(value);
      const label = field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
      return `${label}: ${message}`;
    })
    .join(' ');
}

export default function TeamManagementPage() {
  const { confirm } = useAdminFeedback();
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const response = await teamMembersAPI.list({ ordering: 'sort_order' });
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setTeamMembers(data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load team members.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const orderedMembers = useMemo(
    () =>
      [...teamMembers].sort((a, b) => {
        const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
        if (orderDiff !== 0) return orderDiff;
        return (a.name || '').localeCompare(b.name || '');
      }),
    [teamMembers],
  );

  const filteredMembers = useMemo(() => {
    const term = searchQuery.trim().toLowerCase();
    if (!term) return orderedMembers;
    return orderedMembers.filter((member) =>
      [member.name, member.designation, member.department, member.union_council, member.email, member.phone]
        .filter(Boolean)
        .some((value) => value.toLowerCase().includes(term)),
    );
  }, [orderedMembers, searchQuery]);
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filteredMembers.length / rowsPerPage) - 1));
  const visibleMembers = filteredMembers.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  const openCreate = () => {
    setEditingMember(null);
    setDialogError('');
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (member) => {
    setEditingMember(member);
    setDialogError('');
    setForm({
      name: member.name || '',
      photo: null,
      designation: member.designation || '',
      email: member.email || '',
      phone: member.phone || '',
      union_council: member.union_council || '',
      department: member.department || '',
      bio: member.bio || '',
      status: member.status || 'published',
    });
    setDialogOpen(true);
  };

  const updateForm = (field, value) => {
    setDialogError('');
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setDialogError('Name is required.');
      return;
    }
    if (!form.designation.trim()) {
      setDialogError('Designation is required.');
      return;
    }
    if (!editingMember && !form.photo) {
      setDialogError('Photo is required.');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...form,
        name: form.name.trim(),
        designation: form.designation.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        union_council: form.union_council.trim(),
        department: form.department.trim(),
        bio: form.bio.trim(),
      };

      if (editingMember) {
        await teamMembersAPI.update(editingMember.id, payload);
        setMessage('Team member updated successfully.');
      } else {
        await teamMembersAPI.create(payload);
        setMessage('Team member added successfully.');
      }

      setDialogOpen(false);
      setForm(defaultForm);
      fetchTeamMembers();
    } catch (error) {
      console.error(error);
      setDialogError(formatApiError(error.response?.data));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (member) => {
    const approved = await confirm({
      title: 'Delete team member?',
      description: 'This permanently removes the profile from the team directory and public website.',
      itemName: member.name,
      confirmLabel: 'Delete member',
    });
    if (!approved) return;
    try {
      await teamMembersAPI.delete(member.id);
      setMessage('Team member deleted successfully.');
      fetchTeamMembers();
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete team member.');
    }
  };

  const handleMove = async (member, direction) => {
    const currentIndex = orderedMembers.findIndex((item) => item.id === member.id);
    const targetIndex = currentIndex + direction;

    if (currentIndex === -1 || targetIndex < 0 || targetIndex >= orderedMembers.length) return;

    const reorderedMembers = [...orderedMembers];
    const [movedMember] = reorderedMembers.splice(currentIndex, 1);
    reorderedMembers.splice(targetIndex, 0, movedMember);

    try {
      await Promise.all(
        reorderedMembers.map((item, index) =>
          item.sort_order === index
            ? Promise.resolve()
            : teamMembersAPI.update(item.id, {
                sort_order: index,
                name: item.name,
                designation: item.designation,
              }),
        ),
      );
      setTeamMembers((prev) =>
        prev
          .map((item) => {
            const nextIndex = reorderedMembers.findIndex((orderedItem) => orderedItem.id === item.id);
            return nextIndex === -1 ? item : { ...item, sort_order: nextIndex };
          })
          .sort((a, b) => {
            const orderDiff = (a.sort_order ?? 0) - (b.sort_order ?? 0);
            if (orderDiff !== 0) return orderDiff;
            return (a.name || '').localeCompare(b.name || '');
          }),
      );
    } catch (error) {
      console.error(error);
      setMessage('Unable to update team order.');
    }
  };

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 2, flexWrap: 'wrap' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
            Team Management
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage the public team directory shown on the website.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate} sx={{ textTransform: 'none', fontWeight: 600 }}>
          Add Team Member
        </Button>
      </Box>

      {message && (
        <Alert
          severity={message.toLowerCase().includes('unable') ? 'error' : 'success'}
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <Box
          sx={{
            p: 3,
            bgcolor: '#fafbfc',
            display: 'flex',
            justifyContent: 'space-between',
            gap: 2,
            alignItems: 'center',
            flexWrap: 'wrap',
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600, fontSize: '1rem' }}>
            All Team Members
          </Typography>
          <TextField
            placeholder="Search team..."
            value={searchQuery}
            onChange={(event) => { setSearchQuery(event.target.value); setPage(0); }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search sx={{ color: '#999' }} />
                </InputAdornment>
              ),
            }}
            variant="outlined"
            size="small"
            sx={{ width: { xs: '100%', sm: 280 } }}
          />
        </Box>

        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: '#fafbfc', '& th': { fontWeight: 600, fontSize: '0.875rem', color: '#4a4a4a' } }}>
                <TableCell>Member</TableCell>
                <TableCell>Designation</TableCell>
                <TableCell>Department</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Order</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleMembers.map((member) => {
                const sortedIndex = orderedMembers.findIndex((item) => item.id === member.id);
                const isFirst = sortedIndex <= 0;
                const isLast = sortedIndex === orderedMembers.length - 1;

                return (
                <TableRow key={member.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar src={member.photo} alt={member.name} sx={{ width: 44, height: 44 }} />
                      <Box>
                        <Typography sx={{ fontWeight: 700 }}>{member.name}</Typography>
                        {member.union_council && (
                          <Typography variant="body2" color="text.secondary">
                            UC: {member.union_council}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{member.designation}</TableCell>
                  <TableCell>{member.department || 'N/A'}</TableCell>
                  <TableCell>
                    <Typography variant="body2">{member.phone || 'N/A'}</Typography>
                    {member.email && (
                      <Typography variant="body2" color="text.secondary">
                        {member.email}
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={member.status}
                      size="small"
                      variant={member.status === 'published' ? 'filled' : 'outlined'}
                      color={member.status === 'published' ? 'success' : 'default'}
                    />
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      <Typography variant="body2" sx={{ minWidth: 28 }}>
                        {sortedIndex + 1}
                      </Typography>
                      <Tooltip title="Move up">
                        <span>
                          <IconButton size="small" disabled={isFirst} onClick={() => handleMove(member, -1)}>
                            <KeyboardArrowUp fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                      <Tooltip title="Move down">
                        <span>
                          <IconButton size="small" disabled={isLast} onClick={() => handleMove(member, 1)}>
                            <KeyboardArrowDown fontSize="small" />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </Box>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(member)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(member)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
                );
              })}
              {!loading && filteredMembers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    No team members found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <AdminTablePagination
          count={filteredMembers.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        />
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
        <DialogContent dividers>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Grid container spacing={2.5} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Name"
                value={form.name}
                onChange={(event) => updateForm('name', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                required
                label="Designation"
                placeholder="MNA, PA, Coordinator..."
                value={form.designation}
                onChange={(event) => updateForm('designation', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Department"
                value={form.department}
                onChange={(event) => updateForm('department', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Union Council"
                value={form.union_council}
                onChange={(event) => updateForm('union_council', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={form.email}
                onChange={(event) => updateForm('email', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Phone"
                value={form.phone}
                onChange={(event) => updateForm('phone', event.target.value)}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Bio"
                multiline
                rows={3}
                value={form.bio}
                onChange={(event) => updateForm('bio', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={form.status}
                onChange={(event) => updateForm('status', event.target.value)}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                Photo {editingMember ? '(upload to replace)' : ''}
              </Typography>
              <input type="file" accept="image/*" onChange={(event) => updateForm('photo', event.target.files?.[0] || null)} />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Team Member'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
