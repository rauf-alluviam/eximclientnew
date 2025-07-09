import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Chip, 
  Box, 
  Stack,
  Divider 
} from '@mui/material';

const MobileJobCard = ({ job, getStatusColor, onRowClick }) => {
  return (
    <Card 
      sx={{ 
        mb: 2, 
        cursor: 'pointer',
        backgroundColor: getStatusColor(job.detailed_status),
        '&:hover': {
          boxShadow: 3,
          transform: 'translateY(-1px)',
          transition: 'all 0.2s ease-in-out'
        }
      }}
      onClick={() => onRowClick && onRowClick(job)}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 'bold', fontSize: '1rem' }}>
            {job.job_no}
          </Typography>
          <Chip 
            label={job.detailed_status} 
            size="small" 
            sx={{ 
              fontSize: '0.7rem',
              height: '20px',
              backgroundColor: getStatusColor(job.detailed_status),
              border: '1px solid #666',
              color: '#333'
            }}
          />
        </Box>
        
        <Stack spacing={1} divider={<Divider />}>
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
              Importer:
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
              {job.importer || 'N/A'}
            </Typography>
          </Box>
          
          {job.exporter && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                Exporter:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {job.exporter}
              </Typography>
            </Box>
          )}
          
          {job.awb_bl_number && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                AWB/BL Number:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {job.awb_bl_number}
              </Typography>
            </Box>
          )}
          
          {job.eta_date && (
            <Box>
              <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>
                ETA Date:
              </Typography>
              <Typography variant="body2" sx={{ fontSize: '0.85rem' }}>
                {new Date(job.eta_date).toLocaleDateString()}
              </Typography>
            </Box>
          )}
        </Stack>
      </CardContent>
    </Card>
  );
};

export default MobileJobCard;
