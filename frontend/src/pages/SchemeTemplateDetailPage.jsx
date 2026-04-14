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

  // Detail modal and comments states
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

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
    } catch (err) {
      alert('Error adding comment');
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

          <Typography variant="h6" sx={{ mb: 2 }}>Existing Schemes</Typography>
          {loading ? (
            <LinearProgress />
          ) : entries.length === 0 ? (
            <Typography color="text.secondary">No schemes have been added yet.</Typography>
          ) : (
            <>
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
                <TextField
                  placeholder="Search schemes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                  variant="outlined"
                  size="small"
                  sx={{ width: '300px' }}
                />
              </Box>
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
                  {filteredEntries.length === 0 && searchQuery ? (
                    <TableRow>
                      <TableCell colSpan={template.field_definitions.length + 4} align="center" sx={{ py: 3 }}>
                        <Typography color="text.secondary">No entries match your search</Typography>
                      </TableCell>
                    </TableRow>
                  ) : null}
                  {filteredEntries.map((entry, idx) => (
                    <TableRow 
                      key={entry.id} 
                      hover 
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleEntryClick(entry)}
                    >
                      <TableCell>{idx + 1}</TableCell>
                      {template.field_definitions.map((field) => (
                        <TableCell key={field}>{entry.values?.[field] || '-'}</TableCell>
                      ))}
                      <TableCell>{entry.created_by_name || '—'}</TableCell>
                      <TableCell>{new Date(entry.created_at).toLocaleString()}</TableCell>
                      <TableCell>
                        <IconButton size="small" color="primary" onClick={(e) => { e.stopPropagation(); handleEditEntry(entry); }}>
                          <Edit fontSize="small" />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={(e) => { e.stopPropagation(); handleDeleteEntry(entry.id); }}>
                          <Delete fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            </>
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

      {/* Entry Detail Modal */}
      <Dialog 
        open={detailModalOpen} 
        onClose={() => setDetailModalOpen(false)} 
        maxWidth="md" 
        fullWidth
        sx={{ '& .MuiDialog-paper': { height: '80vh' } }}
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Comment color="primary" />
            Entry Details
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEntry && (
            <>
              <Typography variant="h6" sx={{ mb: 2 }}>Entry Information</Typography>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                {template?.field_definitions.map((field) => (
                  <Grid item xs={12} md={6} key={field}>
                    <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {field}
                      </Typography>
                      <Typography variant="body1">
                        {selectedEntry.values?.[field] || 'Not provided'}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Added By
                    </Typography>
                    <Typography variant="body1">
                      {selectedEntry.created_by_name || 'Unknown'}
                    </Typography>
                  </Paper>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Added On
                    </Typography>
                    <Typography variant="body1">
                      {new Date(selectedEntry.created_at).toLocaleString()}
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>

              <Divider sx={{ my: 3 }} />

              <Typography variant="h6" sx={{ mb: 2 }}>Comments</Typography>
              
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

              <Box sx={{ display: 'flex', gap: 1 }}>
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
                />
                <Button
                  variant="contained"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  sx={{ alignSelf: 'flex-end' }}
                >
                  <Send />
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
