import TablePagination from '@mui/material/TablePagination';

export default function AdminTablePagination({
  count,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [10, 25, 50],
}) {
  return (
    <TablePagination
      component="div"
      count={count}
      page={Math.min(page, Math.max(0, Math.ceil(count / rowsPerPage) - 1))}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      onPageChange={(_, nextPage) => onPageChange(nextPage)}
      onRowsPerPageChange={(event) => onRowsPerPageChange(Number(event.target.value))}
      labelRowsPerPage="Rows"
      labelDisplayedRows={({ from, to, count: total }) => `${from}-${to} of ${total}`}
      slotProps={{
        select: { 'aria-label': 'Rows per page' },
        actions: {
          previousButton: { 'aria-label': 'Previous page' },
          nextButton: { 'aria-label': 'Next page' },
        },
      }}
    />
  );
}

