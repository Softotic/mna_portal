import { useCallback, useState, useEffect } from 'react';
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
  Chip,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  InputAdornment,
} from '@mui/material';
import { ArrowBack, Edit, Delete, Comment, Send, Search } from '@mui/icons-material';
import { schemeTemplatesAPI, schemeTemplateEntriesAPI, schemeEntryCommentsAPI } from '../api';
import { useAuth } from '../auth/AuthContext';
import AdminTablePagination from '../components/AdminTablePagination';
import { useAdminFeedback } from '../feedback/AdminFeedbackContext';

export default function SchemeTemplateDetailPage() {
  const { category_slug, template_id } = useParams();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { notify } = useAdminFeedback();
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

  // Detail modal and comments states
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchTemplate = useCallback(() => {
    schemeTemplatesAPI.get(template_id)
      .then(res => setTemplate(res.data))
      .catch(console.error);
  }, [template_id]);

  const fetchEntries = useCallback(() => {
    schemeTemplateEntriesAPI.list({ template_id })
      .then(res => setEntries(res.data.results || res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [template_id]);

  useEffect(() => {
    fetchTemplate();
    fetchEntries();
  }, [fetchEntries, fetchTemplate]);

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
      notify(err.response?.data?.detail || 'Unable to update the entry.', 'error');
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
    } catch {
      notify('Unable to delete the entry.', 'error');
    }
  };

  const handleEntryClick = async (entry) => {
    setSelectedEntry(entry);
    setDetailModalOpen(true);
    setCommentsLoading(true);
    
    try {
      const response = await schemeEntryCommentsAPI.list({ entry_id: entry.id });
      setComments(response.data.results || response.data);
    } catch (err) {
      console.error('Error fetching comments:', err);
      setComments([]);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedEntry) return;

    try {
      await schemeEntryCommentsAPI.create({
        entry: selectedEntry.id,
        comment: newComment.trim(),
      });
      
      // Refresh comments
      const response = await schemeEntryCommentsAPI.list({ entry_id: selectedEntry.id });
      setComments(response.data.results || response.data);
      setNewComment('');
    } catch {
      notify('Unable to add the comment.', 'error');
    }
  };

  // Filter entries based on search query
  const filteredEntries = entries.filter((entry) => {
    if (!searchQuery.trim()) return true;
    const searchLower = searchQuery.toLowerCase();
    
    // Search in all field values
    for (const field of template?.field_definitions || []) {
      if (entry.values?.[field]?.toLowerCase().includes(searchLower)) {
        return true;
      }
    }
    
    // Search in created_by_name
    if (entry.created_by_name?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  });
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filteredEntries.length / rowsPerPage) - 1));
  const visibleEntries = filteredEntries.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

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
      notify(err.response?.data?.detail || 'Unable to save the scheme entry.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (!template) {
    return <LinearProgress />;
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Button startIcon={<ArrowBack />} onClick={() => navigate(category_slug ? `/schemes/${category_slug}` : '/schemes')} sx={{ textTransform: 'none' }}>
          Back
        </Button>
        <Box sx={{ flex: 1 }}>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
            {template.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {template.category_name}
          </Typography>
        </Box>
      </Box>

      {/* Add Entry Form Card */}
      {canAdd && <Card sx={{ mb: 4 }}>
        <CardHeader
          title="Add New Entry"
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, fontSize: '1rem' } }}
          sx={{ pb: 2, pt: 3, px: 3, bgcolor: '#fafbfc' }}
        />
        <Divider />
        <CardContent sx={{ pt: 3 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Fill out the fields below to create a new entry.
          </Typography>

          {template.field_definitions.length === 0 ? (
            <Typography color="text.secondary">
              This scheme has no fields yet. Go back and edit the scheme to add field names first.
            </Typography>
          ) : (
            <Box component="form" onSubmit={handleSubmit}>
              <Grid container spacing={2.5}>
                {template.field_definitions.map((field) => (
                  <Grid item xs={12} md={6} key={field}>
                    <TextField
                      label={field}
                      name={field}
                      value={values[field] || ''}
                      onChange={(event) => handleValueChange(field, event.target.value)}
                      fullWidth
                      variant="outlined"
                      size="small"
                      sx={{
                        '& .MuiOutlinedInput-root': {
                          bgcolor: '#fff',
                          '&:hover fieldset': { borderColor: '#d0d0d0' },
                        },
                      }}
                    />
                  </Grid>
                ))}
              </Grid>
              <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                <Button variant="outlined" onClick={() => setValues(Object.fromEntries(Object.keys(values).map((key) => [key, ''])))}>Clear</Button>
                <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: 'none', fontWeight: 600 }}>
                  {saving ? 'Saving...' : 'Add Entry'}
                </Button>
              </Box>
            </Box>
          )}

        </CardContent>
      </Card>}

      {/* Existing Entries Card */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)', mt: 4 }}>
        <CardHeader
          title="Existing Entries"
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, fontSize: '1rem' } }}
          sx={{ pb: 2, pt: 3, px: 3, bgcolor: '#fafbfc' }}
          action={entries.length > 0 && (
            <TextField
              placeholder="Search entries..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              slotProps={{
                input: { startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#999' }} />
                  </InputAdornment>
                ) },
              }}
              variant="outlined"
              size="small"
              sx={{ width: '280px', mr: 0 }}
            />
          )}
        />
        <Divider />
        <CardContent sx={{ pt: 0 }}>
          {loading ? (
            <Box sx={{ py: 4 }}><LinearProgress /></Box>
          ) : entries.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No entries have been added yet.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafbfc', '& th': { fontWeight: 600, fontSize: '0.875rem', color: '#4a4a4a' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>#</TableCell>
                    {template.field_definitions.map((field) => (
                      <TableCell key={field} sx={{ fontWeight: 600 }}>{field}</TableCell>
                    ))}
                    <TableCell sx={{ fontWeight: 600 }}>Added By</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Added On</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredEntries.length === 0 && searchQuery ? (
                    <TableRow>
                      <TableCell colSpan={template.field_definitions.length + 4} align="center" sx={{ py: 4 }}>
                        <Typography color="text.secondary" variant="body2">No entries match your search</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {visibleEntries.map((entry, idx) => (
                    <TableRow 
                      key={entry.id} 
                      hover 
                      sx={{ 
                        cursor: 'pointer',
                        '&:hover': { bgcolor: '#f5f7fa' },
                        '& td': { py: 1.5, px: 2 }
                      }}
                      onClick={() => handleEntryClick(entry)}
                    >
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{currentPage * rowsPerPage + idx + 1}</TableCell>
                      {template.field_definitions.map((field) => (
                        <TableCell key={field} sx={{ fontSize: '0.875rem' }}>{entry.values?.[field] || '-'}</TableCell>
                      ))}
                      <TableCell sx={{ fontSize: '0.875rem' }}>{entry.created_by_name || 'Not available'}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: '#666' }}>{new Date(entry.created_at).toLocaleString()}</TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }} title="Edit">
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }} title="Delete">
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
        <AdminTablePagination
          count={filteredEntries.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        />
      </Card>

      {/* Edit Entry Dialog */}
      <Dialog open={editDialogOpen} onClose={() => setEditDialogOpen(false)} maxWidth="md" fullWidth>
        <form onSubmit={handleEditSubmit}>
          <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', pt: 3 }}>Edit Entry</DialogTitle>
          <DialogContent dividers sx={{ pt: 3 }}>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Update the entry information below.
            </Typography>
            <Grid container spacing={2.5}>
              {template?.field_definitions.map((field) => (
                <Grid item xs={12} md={6} key={field}>
                  <TextField
                    label={field}
                    name={field}
                    value={editValues[field] || ''}
                    onChange={(event) => handleEditValueChange(field, event.target.value)}
                    fullWidth
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setEditDialogOpen(false)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving} sx={{ textTransform: 'none', fontWeight: 600 }}>
              {saving ? 'Updating...' : 'Update Entry'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', pt: 3 }}>Confirm Deletion</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <DialogContentText>
            Are you sure you want to delete this entry? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={handleDeleteConfirm} color="error" variant="contained" sx={{ textTransform: 'none', fontWeight: 600 }}>
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Entry Detail Modal */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '80vh' } }}
      >
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', pt: 3, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Comment color="primary" />
          Entry Details
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          {selectedEntry && (
            <>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Entry Information</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {template?.field_definitions.map((field) => (
                  <Grid item xs={12} md={6} key={field}>
                    <Paper sx={{ p: 2.5, bgcolor: '#fafbfc', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                      <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                        {field}
                      </Typography>
                      <Typography variant="body2">
                        {selectedEntry.values?.[field] || <em style={{ color: '#999' }}>Not provided</em>}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, bgcolor: '#fafbfc', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Added By
                    </Typography>
                    <Typography variant="body2">
                      {selectedEntry.created_by_name || 'Unknown'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2.5, bgcolor: '#fafbfc', border: '1px solid #e0e0e0', borderRadius: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600, mb: 0.5 }}>
                      Added On
                    </Typography>
                    <Typography variant="body2">
                      {new Date(selectedEntry.created_at).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>Comments</Typography>
              
              {commentsLoading ? (
                <LinearProgress />
              ) : (
                <List sx={{ mb: 3 }}>
                  {comments.length === 0 ? (
                    <Typography color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                      No comments yet. Be the first to comment!
                    </Typography>
                  ) : (
                    comments.map((comment) => (
                      <ListItem key={comment.id} alignItems="flex-start">
                        <ListItemAvatar>
                          <Avatar>
                            {comment.created_by_name?.charAt(0)?.toUpperCase() || 'U'}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              <Typography variant="subtitle2">
                                {comment.created_by_name || 'Unknown User'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {new Date(comment.created_at).toLocaleString()}
                              </Typography>
                            </Box>
                          }
                          secondary={comment.comment}
                        />
                      </ListItem>
                    ))
                  )}
                </List>
              )}

              <Divider sx={{ my: 2 }} />

              <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                <TextField
                  fullWidth
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  multiline
                  rows={2}
                  size="small"
                  variant="outlined"
                />
                <Button
                  variant="outlined"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  sx={{ alignSelf: 'flex-end', textTransform: 'none', fontWeight: 600 }}
                >
                  <Send sx={{ mr: 1 }} />
                  Send
                </Button>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
