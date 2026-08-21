import { useState, useEffect } from 'react';
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
  LinearProgress,
  Alert,
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
  Chip,
  InputAdornment,
} from '@mui/material';
import {
  Edit,
  Delete,
  Add as AddIcon,
  Search,
  Publish,
  Visibility,
  VisibilityOff,
  Star,
  StarBorder,
} from '@mui/icons-material';
import { newsAdminAPI } from '../api';
import AdminTablePagination from '../components/AdminTablePagination';
import { useAdminFeedback } from '../feedback/AdminFeedbackContext';
import { useAuth } from '../auth/AuthContext';

export default function NewsManagementPage() {
  const { confirm } = useAdminFeedback();
  const { hasPermission } = useAuth();
  const canCreate = hasPermission('NEWS', 'create');
  const canEdit = hasPermission('NEWS', 'edit');
  const canDelete = hasPermission('NEWS', 'delete');
  const [newsList, setNewsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [dialogError, setDialogError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    image: null,
    images: [],
    status: 'draft',
    featured: false,
  });

  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    setLoading(true);
    try {
      const response = await newsAdminAPI.list({});
      setNewsList(response.data.results || response.data);
    } catch (err) {
      setMessage('Error loading news');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const formatApiError = (data) => {
    if (!data) return 'Error saving news';
    if (typeof data === 'string') return data;
    if (data.detail) return data.detail;

    return Object.entries(data)
      .map(([field, value]) => {
        const message = Array.isArray(value) ? value.join(' ') : String(value);
        const label = field.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
        return `${label}: ${message}`;
      })
      .join(' ');
  };

  const handleTitleChange = (title) => {
    setFormData((prev) => ({
      ...prev,
      title,
      slug: generateSlug(title),
    }));
  };

  const handleChange = (field, value) => {
    setDialogError('');
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (file) => {
    if (file) {
      setDialogError('');
      setFormData((prev) => ({ ...prev, image: file }));
    }
  };

  const handleGalleryChange = (files) => {
    setDialogError('');
    setFormData((prev) => ({ ...prev, images: Array.from(files || []) }));
  };

  const handleOpenDialog = (news = null) => {
    setDialogError('');
    if (news) {
      setEditingNews(news);
      setFormData({
        title: news.title,
        slug: news.slug,
        excerpt: news.excerpt,
        content: news.content,
        image: null,
        images: [],
        status: news.status,
        featured: news.featured,
      });
    } else {
      setEditingNews(null);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image: null,
        images: [],
        status: 'draft',
        featured: false,
      });
    }
    setOpenDialog(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setDialogError('Title is required.');
      return;
    }
    if (!formData.content.trim()) {
      setDialogError('Content is required.');
      return;
    }

    setSaving(true);
    try {
      const data = {
        ...formData,
        title: formData.title.trim(),
        slug: formData.slug.trim(),
        excerpt: formData.excerpt.trim(),
        content: formData.content.trim(),
      };

      if (editingNews) {
        await newsAdminAPI.update(editingNews.id, data);
        setMessage('News updated successfully!');
      } else {
        await newsAdminAPI.create(data);
        setMessage('News created successfully!');
      }

      setOpenDialog(false);
      setFormData({
        title: '',
        slug: '',
        excerpt: '',
        content: '',
        image: null,
        images: [],
        status: 'draft',
        featured: false,
      });
      setTimeout(() => setMessage(''), 3000);
      fetchNews();
    } catch (err) {
      setDialogError(formatApiError(err.response?.data));
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (news) => {
    const approved = await confirm({
      title: 'Delete news article?',
      description: 'This permanently removes the article and it will no longer appear on the public website.',
      itemName: news.title,
      confirmLabel: 'Delete article',
    });
    if (!approved) return;

    try {
      await newsAdminAPI.delete(news.id);
      setMessage('News deleted successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchNews();
    } catch (err) {
      setMessage('Error deleting news');
      console.error(err);
    }
  };

  const handlePublish = async (id) => {
    try {
      await newsAdminAPI.publish(id);
      setMessage('News published successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchNews();
    } catch (err) {
      setMessage('Error publishing news');
      console.error(err);
    }
  };

  const handleUnpublish = async (id) => {
    try {
      await newsAdminAPI.unpublish(id);
      setMessage('News unpublished successfully!');
      setTimeout(() => setMessage(''), 3000);
      fetchNews();
    } catch (err) {
      setMessage('Error unpublishing news');
      console.error(err);
    }
  };

  const handleToggleFeatured = async (id) => {
    try {
      await newsAdminAPI.toggleFeatured(id);
      setMessage('Featured status updated!');
      setTimeout(() => setMessage(''), 3000);
      fetchNews();
    } catch (err) {
      setMessage('Error updating featured status');
      console.error(err);
    }
  };

  const filteredNews = newsList.filter((news) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      news.title.toLowerCase().includes(searchLower) ||
      news.excerpt.toLowerCase().includes(searchLower)
    );
  });
  const currentPage = Math.min(page, Math.max(0, Math.ceil(filteredNews.length / rowsPerPage) - 1));
  const visibleNews = filteredNews.slice(currentPage * rowsPerPage, currentPage * rowsPerPage + rowsPerPage);

  if (loading) {
    return <LinearProgress />;
  }

  return (
    <Box>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, color: '#1a1a1a', mb: 0.5 }}>
            News & Updates
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage news and updates for your public website
          </Typography>
        </Box>
        {canCreate && <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
          sx={{ textTransform: 'none', fontWeight: 600 }}
        >
          Add News
        </Button>}
      </Box>

      {message && (
        <Alert
          severity={message.includes('Error') ? 'error' : 'success'}
          sx={{ mb: 3 }}
          onClose={() => setMessage('')}
        >
          {message}
        </Alert>
      )}

      {/* News List */}
      <Card sx={{ borderRadius: 2, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
        <CardHeader
          title="All News"
          titleTypographyProps={{ variant: 'h6', sx: { fontWeight: 600, fontSize: '1rem' } }}
          sx={{ pb: 2, pt: 3, px: 3, bgcolor: '#fafbfc' }}
          action={
            <TextField
              placeholder="Search news..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setPage(0); }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: '#999' }} />
                  </InputAdornment>
                ),
              }}
              variant="outlined"
              size="small"
              sx={{ width: '280px', mr: 0 }}
            />
          }
        />
        <Divider />
        <CardContent sx={{ pt: 0 }}>
          {filteredNews.length === 0 ? (
            <Box sx={{ py: 6, textAlign: 'center' }}>
              <Typography color="text.secondary">No news found.</Typography>
            </Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#fafbfc', '& th': { fontWeight: 600, fontSize: '0.875rem', color: '#4a4a4a' } }}>
                    <TableCell sx={{ fontWeight: 600 }}>Title</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Published</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Featured</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Created</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {visibleNews.map((news) => (
                    <TableRow
                      key={news.id}
                      hover
                      sx={{
                        '& td': { py: 1.5, px: 2 },
                      }}
                    >
                      <TableCell sx={{ fontSize: '0.875rem' }}>{news.title}</TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        <Chip
                          label={news.status}
                          size="small"
                          variant={news.status === 'published' ? 'filled' : 'outlined'}
                          color={news.status === 'published' ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem' }}>
                        {news.published_at
                          ? new Date(news.published_at).toLocaleDateString()
                          : '-'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', textAlign: 'center' }}>
                        {canEdit && <IconButton
                          size="small"
                          color={news.featured ? 'warning' : 'default'}
                          onClick={() => handleToggleFeatured(news.id)}
                          title={news.featured ? 'Remove from featured' : 'Mark as featured'}
                        >
                          {news.featured ? (
                            <Star fontSize="small" />
                          ) : (
                            <StarBorder fontSize="small" />
                          )}
                        </IconButton>}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.875rem', color: '#666' }}>
                        {new Date(news.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }}>
                        {canEdit && <IconButton
                          size="small"
                          color="primary"
                          onClick={() => handleOpenDialog(news)}
                          title="Edit"
                        >
                          <Edit fontSize="small" />
                        </IconButton>}
                        {canEdit && (news.status === 'draft' ? (
                          <IconButton
                            size="small"
                            color="success"
                            onClick={() => handlePublish(news.id)}
                            title="Publish"
                          >
                            <Publish fontSize="small" />
                          </IconButton>
                        ) : (
                          <IconButton
                            size="small"
                            color="warning"
                            onClick={() => handleUnpublish(news.id)}
                            title="Unpublish"
                          >
                            <VisibilityOff fontSize="small" />
                          </IconButton>
                        ))}
                        {canDelete && <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(news)}
                          title="Delete"
                        >
                          <Delete fontSize="small" />
                        </IconButton>}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
        <AdminTablePagination
          count={filteredNews.length}
          page={currentPage}
          rowsPerPage={rowsPerPage}
          onPageChange={setPage}
          onRowsPerPageChange={(value) => { setRowsPerPage(value); setPage(0); }}
        />
      </Card>

      {/* Add/Edit News Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle sx={{ fontWeight: 600, fontSize: '1.25rem', pt: 3 }}>
          {editingNews ? 'Edit News' : 'Add New News'}
        </DialogTitle>
        <DialogContent dividers sx={{ pt: 3 }}>
          {dialogError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {dialogError}
            </Alert>
          )}
          <Grid container spacing={2.5}>
            <Grid item xs={12}>
              <TextField
                label="Title"
                fullWidth
                value={formData.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                variant="outlined"
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Slug"
                fullWidth
                value={formData.slug}
                onChange={(e) => handleChange('slug', e.target.value)}
                variant="outlined"
                size="small"
                helperText="URL-friendly version of the title"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Excerpt"
                fullWidth
                multiline
                rows={2}
                value={formData.excerpt}
                onChange={(e) => handleChange('excerpt', e.target.value)}
                variant="outlined"
                size="small"
                helperText="Short summary shown in listings"
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Content"
                fullWidth
                multiline
                rows={6}
                value={formData.content}
                onChange={(e) => handleChange('content', e.target.value)}
                variant="outlined"
                size="small"
                required
              />
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  News Image
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange(e.target.files?.[0])}
                />
              </Box>
            </Grid>
            <Grid item xs={12}>
              <Box>
                <Typography variant="body2" sx={{ mb: 1, fontWeight: 600 }}>
                  Additional News Images
                </Typography>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleGalleryChange(e.target.files)}
                />
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.7 }}>
                  Select one or more images. If multiple images exist, the public article shows a slideshow.
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            disabled={saving}
            onClick={handleSave}
            sx={{ textTransform: 'none', fontWeight: 600 }}
          >
            {saving ? 'Saving...' : 'Save News'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
