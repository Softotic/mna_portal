import { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Tooltip,
  LinearProgress,
} from '@mui/material';
import { Edit } from '@mui/icons-material';
import { complaintsAPI } from '../api/index.js';

const statusOptions = ['pending', 'in_progress', 'resolved', 'closed'];

export default function ComplaintsManagementPage() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [updateState, setUpdateState] = useState({ status: '', admin_notes: '', admin_attachment: null });
  const [saving, setSaving] = useState(false);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const response = await complaintsAPI.list();
      setComplaints(response.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const openEditDialog = (complaint) => {
    setSelectedComplaint(complaint);
    setUpdateState({
      status: complaint.status || 'pending',
      admin_notes: complaint.admin_notes || '',
      admin_attachment: null,
    });
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    if (!selectedComplaint) return;
    setSaving(true);
    try {
      await complaintsAPI.update(selectedComplaint.id, updateState);
      setEditOpen(false);
      fetchComplaints();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" sx={{ fontWeight: 800, mb: 2 }}>
        Complaints Management
      </Typography>
      <Typography variant="body1" sx={{ mb: 4, color: 'text.secondary' }}>
        Review submitted complaints, update statuses, and attach internal notes or follow-up files.
      </Typography>

      <Card sx={{ borderRadius: 4, overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Tracking #</TableCell>
                <TableCell>Name</TableCell>
                <TableCell>CNIC</TableCell>
                <TableCell>Category</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Submitted</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {complaints.map((complaint) => (
                <TableRow key={complaint.id} hover>
                  <TableCell>{complaint.tracking_number}</TableCell>
                  <TableCell>{complaint.name}</TableCell>
                  <TableCell>{complaint.cnic}</TableCell>
                  <TableCell>{complaint.category}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{complaint.status.replace('_', ' ')}</TableCell>
                  <TableCell>{new Date(complaint.created_at).toLocaleDateString()}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit complaint">
                      <IconButton size="small" onClick={() => openEditDialog(complaint)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && complaints.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 6 }}>
                    No complaints found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>

      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Update Complaint</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">
                {selectedComplaint?.tracking_number}
              </Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 1 }}>
                {selectedComplaint?.name}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                fullWidth
                value={updateState.status}
                onChange={(e) => setUpdateState((prev) => ({ ...prev, status: e.target.value }))}
                size="small"
              >
                {statusOptions.map((item) => (
                  <MenuItem key={item} value={item}>
                    {item.replace('_', ' ')}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Admin Notes"
                fullWidth
                multiline
                rows={4}
                value={updateState.admin_notes}
                onChange={(e) => setUpdateState((prev) => ({ ...prev, admin_notes: e.target.value }))}
                size="small"
              />
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" component="label" sx={{ textTransform: 'none' }}>
                Upload Internal Attachment
                <input
                  type="file"
                  hidden
                  onChange={(e) => setUpdateState((prev) => ({ ...prev, admin_attachment: e.target.files?.[0] }))}
                />
              </Button>
              {updateState.admin_attachment && (
                <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
                  {updateState.admin_attachment.name}
                </Typography>
              )}
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleUpdate} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
