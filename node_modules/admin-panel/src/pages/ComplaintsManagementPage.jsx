import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
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
import { Attachment, Edit, Refresh } from '@mui/icons-material';
import { complaintsAPI } from '../api/index.js';

const statusOptions = ['submitted', 'in_progress', 'resolved', 'declined'];

function formatStatus(status) {
  return (status || 'submitted').replace(/_/g, ' ');
}

function getStatusColor(status) {
  if (status === 'resolved') return 'success';
  if (status === 'declined') return 'error';
  if (status === 'in_progress') return 'warning';
  return 'default';
}

function attachmentName(path) {
  return path?.split('/').pop() || 'Open attachment';
}

export default function ComplaintsManagementPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [editOpen, setEditOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [filters, setFilters] = useState({ search: '', status: '' });
  const [updateState, setUpdateState] = useState({ status: 'submitted', comment: '', attachment: null });

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.search) params.search = filters.search;
      if (filters.status) params.status = filters.status;
      const response = await complaintsAPI.list(params);
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setComplaints(data);
    } catch (err) {
      console.error(err);
      setMessage('Unable to load complaints.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filters.status]);

  const filteredComplaints = useMemo(() => {
    if (!filters.search) return complaints;
    const term = filters.search.toLowerCase();
    return complaints.filter((complaint) => {
      return (
        complaint.tracking_number?.toLowerCase().includes(term) ||
        complaint.name?.toLowerCase().includes(term) ||
        complaint.cnic?.toLowerCase().includes(term) ||
        complaint.category?.toLowerCase().includes(term)
      );
    });
  }, [complaints, filters.search]);

  const openEditDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateState({
      status: complaint.status || 'submitted',
      comment: '',
      attachment: null,
    });
    setEditOpen(true);
  };

  const handleSaveUpdate = async () => {
    if (!selectedComplaint) return;
    setSaving(true);
    setMessage('');
    try {
      const response = await complaintsAPI.addUpdate(selectedComplaint.id, updateState);
      setSelectedComplaint(response.data);
      setMessage('Complaint updated successfully.');
      setEditOpen(false);
      fetchComplaints();
    } catch (err) {
      console.error(err);
      setMessage(err.response?.data?.detail || 'Unable to save complaint update.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Complaints Management
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 780, lineHeight: 1.8 }}>
            Review public complaints, update case status, and maintain a visible remark history that citizens can track from the website.
          </Typography>
        </Box>
        <Button onClick={fetchComplaints} startIcon={<Refresh />} variant="outlined">
          Refresh
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

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={8}>
          <TextField
            fullWidth
            label="Search complaints"
            placeholder="Tracking number, name, CNIC, or category"
            value={filters.search}
            onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            select
            fullWidth
            label="Filter by status"
            value={filters.status}
            onChange={(event) => setFilters((prev) => ({ ...prev, status: event.target.value }))}
          >
            <MenuItem value="">All statuses</MenuItem>
            {statusOptions.map((status) => (
              <MenuItem key={status} value={status}>
                {formatStatus(status)}
              </MenuItem>
            ))}
          </TextField>
        </Grid>
      </Grid>

      <Card sx={{ overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking #</TableCell>
                <TableCell>Citizen</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Timeline Entries</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredComplaints.map((complaint) => (
                <TableRow key={complaint.id} hover>
                  <TableCell>{complaint.tracking_number}</TableCell>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{complaint.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {complaint.cnic}
                    </Typography>
                  </TableCell>
                  <TableCell>{complaint.category}</TableCell>
                  <TableCell>
                    <Chip label={formatStatus(complaint.status)} color={getStatusColor(complaint.status)} sx={{ textTransform: 'capitalize' }} />
                  </TableCell>
                  <TableCell>{complaint.updates?.length || 0}</TableCell>
                  <TableCell>{complaint.created_at ? new Date(complaint.created_at).toLocaleDateString() : 'N/A'}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Review and update">
                      <IconButton size="small" onClick={() => openEditDialog(complaint)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && filteredComplaints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 8 }}>
                    No complaints match the current filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Complaint Review</DialogTitle>
        <DialogContent dividers>
          {selectedComplaint && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={7}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="overline" color="secondary.main">
                      {selectedComplaint.category}
                    </Typography>
                    <Typography variant="h5" sx={{ mt: 1 }}>
                      {selectedComplaint.tracking_number}
                    </Typography>
                    <Typography sx={{ mt: 1, fontWeight: 700 }}>{selectedComplaint.name}</Typography>
                    <Typography sx={{ color: 'text.secondary', mt: 0.5 }}>{selectedComplaint.cnic} • {selectedComplaint.phone}</Typography>
                    <Typography sx={{ mt: 2.5, color: 'text.secondary', lineHeight: 1.8 }}>
                      {selectedComplaint.description}
                    </Typography>
                    {selectedComplaint.attachment && (
                      <Typography component="a" href={selectedComplaint.attachment} target="_blank" rel="noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 2, color: 'primary.main', fontWeight: 700 }}>
                        <Attachment sx={{ fontSize: 18 }} />
                        {attachmentName(selectedComplaint.attachment)}
                      </Typography>
                    )}
                  </CardContent>
                </Card>

                <Typography variant="h6" sx={{ mt: 3, mb: 2 }}>
                  Complaint Timeline
                </Typography>
                <Stack spacing={2}>
                  {selectedComplaint.updates?.length ? (
                    selectedComplaint.updates.map((update) => (
                      <Paper key={update.id} sx={{ p: 2.5, border: '1px solid rgba(0,0,0,0.06)' }}>
                        <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
                          <Chip label={formatStatus(update.status)} color={getStatusColor(update.status)} sx={{ width: 'fit-content', textTransform: 'capitalize' }} />
                          <Typography variant="body2" color="text.secondary">
                            {update.created_at ? new Date(update.created_at).toLocaleString() : 'Logged update'}
                          </Typography>
                        </Stack>
                        {update.comment && (
                          <Typography sx={{ mt: 1.2, color: 'text.secondary', lineHeight: 1.8 }}>
                            {update.comment}
                          </Typography>
                        )}
                        {update.attachment && (
                          <Typography component="a" href={update.attachment} target="_blank" rel="noreferrer" sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.75, mt: 1.2, color: 'primary.main', fontWeight: 700 }}>
                            <Attachment sx={{ fontSize: 18 }} />
                            {attachmentName(update.attachment)}
                          </Typography>
                        )}
                      </Paper>
                    ))
                  ) : (
                    <Paper sx={{ p: 2.5 }}>
                      <Typography sx={{ color: 'text.secondary' }}>
                        No updates have been logged for this complaint yet.
                      </Typography>
                    </Paper>
                  )}
                </Stack>
              </Grid>

              <Grid item xs={12} md={5}>
                <Card variant="outlined">
                  <CardContent>
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Add New Update
                    </Typography>
                    <TextField
                      select
                      fullWidth
                      label="Status"
                      value={updateState.status}
                      onChange={(event) => setUpdateState((prev) => ({ ...prev, status: event.target.value }))}
                      sx={{ mb: 2.5 }}
                    >
                      {statusOptions.map((status) => (
                        <MenuItem key={status} value={status}>
                          {formatStatus(status)}
                        </MenuItem>
                      ))}
                    </TextField>
                    <TextField
                      label="Remark / Comment"
                      fullWidth
                      multiline
                      rows={6}
                      value={updateState.comment}
                      onChange={(event) => setUpdateState((prev) => ({ ...prev, comment: event.target.value }))}
                      helperText="This note will also appear in the complaint tracking history."
                    />
                    <Divider sx={{ my: 2.5 }} />
                    <Button variant="outlined" component="label" startIcon={<Attachment />}>
                      Upload update attachment
                      <input
                        type="file"
                        hidden
                        onChange={(event) => setUpdateState((prev) => ({ ...prev, attachment: event.target.files?.[0] || null }))}
                      />
                    </Button>
                    <Typography sx={{ mt: 1.2, color: 'text.secondary', fontSize: '0.92rem' }}>
                      {updateState.attachment ? updateState.attachment.name : 'Optional internal/public file for this update.'}
                    </Typography>

                    {selectedComplaint.admin_remarks && (
                      <Box sx={{ mt: 3, p: 2.5, borderRadius: 3, bgcolor: 'rgba(25,118,210,0.05)' }}>
                        <Typography variant="subtitle2" sx={{ mb: 0.8 }}>
                          Latest saved remark
                        </Typography>
                        <Typography sx={{ color: 'text.secondary', lineHeight: 1.75 }}>
                          {selectedComplaint.admin_remarks}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Close
          </Button>
          <Button onClick={handleSaveUpdate} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Update'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
