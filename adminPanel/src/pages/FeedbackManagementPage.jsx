import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
  IconButton,
  LinearProgress,
  MenuItem,
  Paper,
  Switch,
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
import { Add, Delete, Edit } from '@mui/icons-material';
import { feedbacksAPI } from '../api/index.js';
import AdminTablePagination from '../components/AdminTablePagination.jsx';

const defaultForm = {
  name: '',
  location: '',
  quote: '',
  status: 'published',
  featured: true,
  sort_order: 0,
};

export default function FeedbackManagementPage() {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const currentPage = Math.min(page, Math.max(0, Math.ceil(feedbacks.length / rowsPerPage) - 1));
  const visibleFeedbacks = feedbacks.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  const fetchFeedbacks = async () => {
    setLoading(true);
    try {
      const response = await feedbacksAPI.list({ ordering: 'sort_order' });
      const data = Array.isArray(response.data) ? response.data : response.data?.results || [];
      setFeedbacks(data);
    } catch (error) {
      console.error(error);
      setMessage('Unable to load feedback entries.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEdit = (feedback) => {
    setEditingId(feedback.id);
    setForm({
      name: feedback.name || '',
      location: feedback.location || '',
      quote: feedback.quote || '',
      status: feedback.status || 'published',
      featured: Boolean(feedback.featured),
      sort_order: feedback.sort_order ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    try {
      if (editingId) {
        await feedbacksAPI.update(editingId, form);
      } else {
        await feedbacksAPI.create(form);
      }
      setDialogOpen(false);
      setForm(defaultForm);
      setMessage('Feedback saved successfully.');
      fetchFeedbacks();
    } catch (error) {
      console.error(error);
      setMessage('Unable to save feedback.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this feedback entry?')) return;
    try {
      await feedbacksAPI.delete(id);
      setMessage('Feedback deleted successfully.');
      fetchFeedbacks();
    } catch (error) {
      console.error(error);
      setMessage('Unable to delete feedback.');
    }
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'flex-start', flexWrap: 'wrap', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 1 }}>
            Feedback Management
          </Typography>
          <Typography sx={{ color: 'text.secondary', maxWidth: 760, lineHeight: 1.8 }}>
            Manage public testimonials and citizen feedback displayed on the public-facing MNA website.
          </Typography>
        </Box>
        <Button variant="contained" startIcon={<Add />} onClick={openCreate}>
          Add Feedback
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

      <Card sx={{ overflow: 'hidden' }}>
        {loading && <LinearProgress />}
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Featured</TableCell>
                <TableCell>Order</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {visibleFeedbacks.map((item) => (
                <TableRow key={item.id} hover>
                  <TableCell>
                    <Typography sx={{ fontWeight: 700 }}>{item.name}</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 420 }}>
                      {item.quote}
                    </Typography>
                  </TableCell>
                  <TableCell>{item.location || 'N/A'}</TableCell>
                  <TableCell sx={{ textTransform: 'capitalize' }}>{item.status}</TableCell>
                  <TableCell>{item.featured ? 'Yes' : 'No'}</TableCell>
                  <TableCell>{item.sort_order}</TableCell>
                  <TableCell align="right">
                    <Tooltip title="Edit">
                      <IconButton size="small" onClick={() => openEdit(item)}>
                        <Edit fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton size="small" color="error" onClick={() => handleDelete(item.id)}>
                        <Delete fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {!loading && feedbacks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                    No feedback entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <AdminTablePagination
          count={feedbacks.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        />
      </Card>

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>{editingId ? 'Edit Feedback' : 'Add Feedback'}</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3} sx={{ pt: 1 }}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Citizen Name"
                value={form.name}
                onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Location"
                value={form.location}
                onChange={(event) => setForm((prev) => ({ ...prev, location: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Feedback Quote"
                multiline
                rows={5}
                value={form.quote}
                onChange={(event) => setForm((prev) => ({ ...prev, quote: event.target.value }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                select
                fullWidth
                label="Status"
                value={form.status}
                onChange={(event) => setForm((prev) => ({ ...prev, status: event.target.value }))}
              >
                <MenuItem value="draft">Draft</MenuItem>
                <MenuItem value="published">Published</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Sort Order"
                type="number"
                value={form.sort_order}
                onChange={(event) => setForm((prev) => ({ ...prev, sort_order: Number(event.target.value) }))}
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <FormControlLabel
                control={
                  <Switch
                    checked={form.featured}
                    onChange={(event) => setForm((prev) => ({ ...prev, featured: event.target.checked }))}
                  />
                }
                label="Feature on website"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button onClick={handleSave} variant="contained" disabled={saving}>
            {saving ? 'Saving...' : 'Save Feedback'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
}
