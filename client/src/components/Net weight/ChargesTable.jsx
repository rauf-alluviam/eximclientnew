import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Button,
  Chip
} from '@mui/material';
import { styled } from '@mui/material/styles';
import FileDownloadIcon from '@mui/icons-material/FileDownload';
import PrintIcon from '@mui/icons-material/Print';
import TableChartIcon from '@mui/icons-material/TableChart';
import CalculateIcon from '@mui/icons-material/Calculate';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  backgroundColor: '#FFFFFF',
  borderRadius: '8px',
  boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)',
  overflow: 'auto',
  border: '1px solid #F0F0F0',
  maxHeight: '600px'
}));

const StyledTableHead = styled(TableHead)(({ theme }) => ({
  '& .group-header': {
    color: 'black',
    fontWeight: '700',
    fontSize: '0.8rem',
    padding: '16px 8px',
    borderBottom: '1px solid rgba(20, 18, 18, 0.2)',
    borderRight: '1px solid rgba(20, 18, 18, 0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: 0,
    zIndex: 10
  },
  '& .charge-header': {
    color: 'black',
    fontWeight: '600',
    fontSize: '0.75rem',
    padding: '12px 8px',
    borderBottom: 'none',
    borderRight: '1px solid rgba(255,255,255,0.2)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    minWidth: '140px',
    textAlign: 'center',
    whiteSpace: 'nowrap',
    position: 'sticky',
    top: '60px',
    zIndex: 9
  }
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(even)': {
    backgroundColor: '#F9FAFB',
  },
  '&:nth-of-type(odd)': {
    backgroundColor: '#FFFFFF',
  },
  '&:hover': {
    backgroundColor: '#F8FAFC',
    transition: 'background-color 0.2s ease'
  },
  '& .MuiTableCell-root': {
    borderBottom: '1px solid #E5E7EB',
    borderRight: '1px solid #E5E7EB',
    padding: '10px 8px',
    fontSize: '0.875rem',
    textAlign: 'center',
    minWidth: '140px',
    whiteSpace: 'nowrap'
  }
}));

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  '&.amount-cell': {
    fontWeight: '600',
    color: '#525252',
    fontFamily: 'monospace',
    fontSize: '0.875rem'
  },
  '&.label-cell': {
    fontWeight: '600',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    position: 'sticky',
    left: 0,
    zIndex: 5,
    borderRight: '2px solid rgba(156,163,175,0.3) !important',
    minWidth: '120px'
  },
  '&.percentage-cell': {
    fontWeight: '500',
    color: 'rgb(79, 70, 229)'
  },
  '&.total-cell': {
    fontWeight: 'bold',
    color: '#374151',
    backgroundColor: '#E5E7EB',
    fontSize: '0.9rem'
  },
  '&.total-header': {
    backgroundColor: '#D1D5DB !important',
    fontWeight: 'bold'
  },
  '&.standard-charge': {
    backgroundColor: '#FAFAFA'
  },
  '&.custom-charge': {
    backgroundColor: '#F8FAFC'
  }
}));

const ChargesTable = ({ jobNo, selectedYear, jobData }) => {
  const [charges, setCharges] = useState(null);
  const [totalCharges, setTotalCharges] = useState(0);
  const [standardCharges, setStandardCharges] = useState([]);
  const [customCharges, setCustomCharges] = useState([]);

  useEffect(() => {
    if (jobData && jobData.net_weight_calculator) {
      setCharges(jobData.net_weight_calculator);
    } else {
      setCharges(null);
    }
  }, [jobData, jobNo, selectedYear]);

  // Calculate table data and total charges in useEffect
  useEffect(() => {
    if (!charges) {
      setStandardCharges([]);
      setCustomCharges([]);
      setTotalCharges(0);
      return;
    }

    const standardChargesData = [
      { key: 'duty', label: 'Duty Amount', amount: charges.duty },
      { key: 'shipping', label: 'Shipping Charges', amount: charges.shipping },
      { key: 'custom_clearance', label: 'Custom Clearance', amount: charges.custom_clearance_charges || charges.customclearancecharges },
      { key: 'detention', label: 'Detention Charges', amount: charges.detention },
      { key: 'cfs', label: 'CFS/ICD Charges', amount: charges.cfs },
      { key: 'transport', label: 'Transport Charges', amount: charges.transport },
      { key: 'Labour', label: 'Labour Charges', amount: charges.Labour }
    ];

    // Add custom fields
    const customChargesData = charges.custom_fields?.map((field, index) => ({
      key: `custom_${index}`,
      label: field.name,
      amount: field.value,
      isCustom: true
    })) || [];
    
    // Calculate total
    const total = [...standardChargesData, ...customChargesData].reduce((sum, item) => sum + parseFloat(item.amount || 0), 0);
    
    setTotalCharges(total);
    setStandardCharges(standardChargesData);
    setCustomCharges(customChargesData);
  }, [charges]);

  // Format number without currency symbol
  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-IN').format(parseFloat(value || 0).toFixed(2));
  };

  // Export to CSV functionality
  const exportToCSV = () => {
    const allCharges = [...standardCharges, ...customCharges];
    const headers = ['Metric', 'Standard Charges', ...standardCharges.map(item => item.label), 'Custom Charges', ...customCharges.map(item => item.label), 'Total'];
    const amountRow = ['Amount (₹)', '', ...standardCharges.map(item => parseFloat(item.amount || 0).toFixed(2)), '', ...customCharges.map(item => parseFloat(item.amount || 0).toFixed(2)), totalCharges.toFixed(2)];
    const percentageRow = ['Percentage (%)', '', ...standardCharges.map(item => 
      totalCharges > 0 ? ((parseFloat(item.amount || 0) / totalCharges) * 100).toFixed(1) : '0.0'
    ), '', ...customCharges.map(item => 
      totalCharges > 0 ? ((parseFloat(item.amount || 0) / totalCharges) * 100).toFixed(1) : '0.0'
    ), '100.0'];

    const csvContent = [
      headers.join(','),
      amountRow.join(','),
      percentageRow.join(',')
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `charges_breakdown_grouped_${jobNo}_${selectedYear}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print functionality
  const handlePrint = () => {
    window.print();
  };

  if (!charges) {
    return (
      <Box sx={{ 
        padding: 3, 
        textAlign: 'center',
        backgroundColor: '#F9FAFB', 
        borderRadius: '8px',
        border: '1px solid #E5E7EB'
      }}>
        <Typography color="textSecondary">
          No charges data available. Please search for a job first.
        </Typography>
      </Box>
    );
  }

  // Calculate column span for group headers
  const standardChargesCount = standardCharges.length;
  const customChargesCount = customCharges.length;

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 4px rgba(0,0,0,0.08), 0 1px 2px rgba(0,0,0,0.16)',
      border: '1px solid #F0F0F0'
    }}>
      {/* Header */}
      <div style={{
        background: 'linear-gradient(135deg, #eef2ff,rgb(249, 240, 255))',
        padding: '20px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(0,0,0,0.1)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{
            width: '40px',
            height: '40px',
            backgroundColor: 'rgba(79, 70, 229, 0.15)',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '16px'
          }}>
            <TableChartIcon style={{ color: 'rgb(79, 70, 229)', fontSize: '24px' }} />
          </div>
          <div>
            <Typography variant="h6" sx={{ color: 'black', fontWeight: '600', margin: 0 }}>
              Charges Breakdown 
            </Typography>
            <Typography variant="body2" sx={{ color: 'rgba(3, 3, 3, 0.85)', fontWeight: '400' }}>
              Job #{jobNo} • Financial Year {selectedYear} • Standard & Custom Charges
            </Typography>
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          <Tooltip title="Export to CSV">
            <IconButton 
              onClick={exportToCSV}
              sx={{ 
                color: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.2)' }
              }}
            >
              <FileDownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Table">
            <IconButton 
              onClick={handlePrint}
              sx={{ 
                color: 'rgb(79, 70, 229)',
                backgroundColor: 'rgba(79, 70, 229, 0.1)',
                '&:hover': { backgroundColor: 'rgba(79, 70, 229, 0.2)' }
              }}
            >
              <PrintIcon />
            </IconButton>
          </Tooltip>
        </div>
      </div>

      {/* Grouped Table */}
      <StyledTableContainer>
        <Table stickyHeader sx={{ minWidth: `${Math.max(800, (standardChargesCount + customChargesCount + 2) * 140)}px` }}>
          <StyledTableHead>
            {/* Group Headers Row */}
            <TableRow>
              <TableCell 
                rowSpan={2}
                sx={{ 
                  position: 'sticky', 
                  left: 0, 
                  zIndex: 11, 
                  background: 'linear-gradient(135deg, rgb(79, 70, 229), rgb(99, 102, 241))',
                  borderRight: '2px solid rgba(255,255,255,0.3) !important',
                  minWidth: '120px',
                  color: '#FFFFFF',
                  fontWeight: '700',
                  fontSize: '0.8rem',
                  padding: '16px 8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  textAlign: 'center'
                }}
              >
                charges
              </TableCell>
              
              {standardCharges.map((item) => (
                <TableCell key={`header-${item.key}`} className="group-header"
                  sx={{ background: '' }}>
                  {item.label}
                </TableCell>
              ))}
              
              {customCharges.map((item) => (
                <TableCell key={`header-${item.key}`} className="group-header" 
                  sx={{ background: 'linear-gradient(135deg, #dbeafe, #FEF3C7)' }}>
                  {item.label}
                </TableCell>
              ))}
              
              <TableCell 
                rowSpan={2}
                className="total-header"
                sx={{ 
                  background: 'linear-gradient(135deg, rgb(79, 70, 229), rgb(99, 102, 241)) !important',
                  color: '#FFFFFF'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                  <CalculateIcon sx={{ fontSize: '16px' }} />
                  <span>Total</span>
                </div>
              </TableCell>
            </TableRow>
          </StyledTableHead>
          
          <TableBody>
            {/* Amount Row */}
            <StyledTableRow>
              <StyledTableCell className="label-cell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>Amount (₹)</span>
                </div>
              </StyledTableCell>
              
              {standardCharges.map((item) => (
                <StyledTableCell key={`amount-${item.key}`} className="amount-cell standard-charge"
                  sx={{ backgroundColor: '#ECFDF5' }}>
                  {formatNumber(item.amount)}
                </StyledTableCell>
              ))}
              
              {customCharges.map((item) => (
                <StyledTableCell key={`amount-${item.key}`} className="amount-cell custom-charge"
                  sx={{ backgroundColor: '#dbeafe' }}>
                  {formatNumber(item.amount)}
                </StyledTableCell>
              ))}
              
              <StyledTableCell className="total-cell"
                sx={{ backgroundColor: '#FEF3C7' }}>
                {formatNumber(totalCharges)}
              </StyledTableCell>
            </StyledTableRow>

            {/* Percentage Row */}
            <StyledTableRow>
              <StyledTableCell className="label-cell">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span>Percentage (%)</span>
                </div>
              </StyledTableCell>
              
              {standardCharges.map((item) => {
                const percentage = totalCharges > 0 ? ((parseFloat(item.amount || 0) / totalCharges) * 100).toFixed(1) : '0.0';
                return (
                  <StyledTableCell key={`percentage-${item.key}`} className="percentage-cell standard-charge"
                    sx={{ backgroundColor: '#ECFDF5' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      {percentage}%
                      {parseFloat(percentage) > 20 && (
                        <TrendingUpIcon sx={{ fontSize: '14px', color: 'rgb(34, 197, 94)' }} />
                      )}
                    </div>
                  </StyledTableCell>
                );
              })}
              
              {customCharges.map((item) => {
                const percentage = totalCharges > 0 ? ((parseFloat(item.amount || 0) / totalCharges) * 100).toFixed(1) : '0.0';
                return (
                  <StyledTableCell key={`percentage-${item.key}`} className="percentage-cell custom-charge"
                    sx={{ backgroundColor: '#dbeafe' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                      {percentage}%
                      {parseFloat(percentage) > 20 && (
                        <TrendingUpIcon sx={{ fontSize: '14px', color: 'rgb(34, 197, 94)' }} />
                      )}
                    </div>
                  </StyledTableCell>
                );
              })}
              
              <StyledTableCell className="total-cell"
                sx={{ backgroundColor: '#FEF3C7' }}>
                100.0%
              </StyledTableCell>
            </StyledTableRow>
          </TableBody>
        </Table>
      </StyledTableContainer>

      {/* Footer Summary */}
      <div style={{
        background: 'linear-gradient(to right, #ECFDF5, #dbeafe)',
        padding: '16px 24px',
        borderTop: '1px solid #E5E5E5'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Typography variant="body2" sx={{ color: '#525252' }}>
              Standard: {standardChargesCount} | Custom: {customChargesCount} | Net Weight: {formatNumber(charges.weight || 0)} kg
            </Typography>
          </div>
          <div style={{ textAlign: 'right' }}>
            <Typography variant="body2" sx={{ color: '#525252' }}>
              Job Reference: {jobNo} | Year: {selectedYear}
            </Typography>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargesTable;