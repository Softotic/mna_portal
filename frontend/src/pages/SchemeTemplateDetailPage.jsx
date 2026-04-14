import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import { ArrowBack, Edit, Delete } from '@mui/icons-material';
import { schemeTemplatesAPI, schemeTemplateEntriesAPI } from '../api';
import { useAuth } from '../auth/AuthContext';

export default function SchemeTemplateDetailPage() {
  const { category_slug, template_id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const canAdd = hasPermission(category_slug ? category_slug.toUpperCase() : 'SCHEMES', 'create');

  const [template, setTemplate] = useState(null);
  const [entries, setEntries] = useState([]);
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit and Delete states
  const [editEntry, setEditEntry] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteEntryId, setDeleteEntryId] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const fetchTemplate = () => {
    schemeTemplatesAPI.get(template_id)
      .then(res => setTemplate(res.data))
      .catch(console.error);
  };

  const fetchEntries = () => {
    schemeTemplateEntriesAPI.list({ template_id })
      .then(res => setEntries(res.data.results || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchTemplate();
    fetchEntries();
  }, [template_id]);

  useEffect(() => {
    if (template?.field_definitions) {
      const initialValues = {};
      template.field_definitions.forEach((field) => {
        initialValues[field] = values[field] ?? '';
      });
      setValues(initialValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [template]);

  const handleValueChange = (field, value) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditValueChange = (field, value) => {
    setEditValues((prev) => ({ ...prev, [field]: value }));
  };

  const handleEditEntry = (entry) => {
    setEditEntry(entry);
    setEditValues(entry.values || {});
    setEditDialogOpen(true);
  };

  const handleEditSubmit = async (event) => {
    event.preventDefault();
    if (!editEntry) return;
    setSaving(true);

    try {
      await schemeTemplateEntriesAPI.update(editEntry.id, {
        template_id: template.id,
        values: editValues,
      });
      setEditDialogOpen(false);
      setEditEntry(null);
      fetchEntries();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error updating entry');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteEntry = (entryId) => {
    setDeleteEntryId(entryId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteEntryId) return;

    try {
      await schemeTemplateEntriesAPI.delete(deleteEntryId);
      setDeleteDialogOpen(false);
      setDeleteEntryId(null);
      fetchEntries();
    } catch (err) {
      alert('Error deleting entry');
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!template) return;
    setSaving(true);

    try {
      await schemeTemplateEntriesAPI.create({
        template_id: template.id,
        values,
      });
      setValues(Object.fromEntries(Object.keys(values).map((key) => [key, ''])));
      fetchEntries();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving scheme entry');
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Button startIcon={<ArrowBack />} onClick={() => navigate(category_slug ? `/schemes/${category_slug}` : '/schemes')}>
        Back to schemes
      </Button>

      <Card sx={{ borderRadius: 3, mt: 2 }}>
        <CardHeader
          title={template.title}
          subheader={`Category: ${template.category_name}`}
        />
        <Divider />
        <CardContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill the fields below to add a new entry for this scheme configuration.
          </Typography>

          {template.field_definitions.length === 0 ? (
            <Typography color="text.secondary">
              This scheme has no fields yet. Go back and edit the scheme to add field names first.
            </Typography>
          ) : (
            <Box component="form" onSubmit={handleSubmit} sx={{ mb: 4 }}>
              <Grid container spacing={2}>
                {template.field_definitions.map((field) => (
                  <Grid item xs={12} md={6} key={field}>
                    <TextField
                      label={field}
                      name={field}
                      value={values[field] || ''}
                      onChange={(event) => handleValueChange(field, event.target.value)}
                      fullWidth
                    />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                <Button type="submit" variant="contained" disabled={saving}>
                  {saving ? 'Saving...' : 'Add Entry'}
                </Button>
              </Box>
            </Box>
          )}

          <Typography variant="h6" sx={{ mb: 2 }}>Existing Entries</Typography>
          {loading ? (
            <LinearProgress />
          ) : entries.length === 0 ? (
            <Typography color="text.secondary">No entries have been added yet.</Typography>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>#</TableCell>
                    {template.field_definitions.map((field) => (
                      <TableCell key={field}>{field}</TableCell>
                    ))}
                    <TableCell>Added By</TableCell>
                    <TableCell>Added On</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {entries.map((entry, idx) => (
                    <TableRow key={entry.id}>
                      <TableCell>{idx + 1}</TableCell>
                      {template.field_definitions.map((field) => (
                        <TableCell key={field}>{entry.values?.[field] || '-'}</TableCell>
                      ))}
                      <TableCell>{entry.created_by_name || '—'}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={() => handleEditEntry(entry)}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleDeleteEntry(entry.id)}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Edit Entry Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleEditSubmit}>
          <DialogTitle>Edit Entry</DialogTitle>
          <DialogContent dividers>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Update the values for this scheme entry.
            </Typography>
            <Grid container spacing={2}>
              {template?.field_definitions.map((field) => (
                <Grid item xs={12} md={6} key={field}>
                  <TextField
                    label={field}
                    name={field}
                    value={editValues[field] || ''}
                    onChange={(event) => handleEditValueChange(field, event.target.value)}
                    fullWidth
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>
              {saving ? 'Updating...' : 'Update Entry'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
