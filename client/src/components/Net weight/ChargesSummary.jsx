import { useState, useEffect } from "react";
import { Typography, Box, CircularProgress, Alert, Tooltip, Fade, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { SimpleHeader } from './SharedComponents';
// You may need to install these icons using: npm install @mui/icons-material
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';
import EngineeringOutlinedIcon from '@mui/icons-material/EngineeringOutlined';
import MoreHorizOutlinedIcon from '@mui/icons-material/MoreHorizOutlined';
import PieChartIcon from '@mui/icons-material/PieChart';

import ShowChartIcon from '@mui/icons-material/ShowChart';
import TableChartIcon from '@mui/icons-material/TableChart';
import RefreshIcon from '@mui/icons-material/Refresh';
import MoreVertIcon from '@mui/icons-material/MoreVert';

// Import needed chart components
import { PieChart } from '@mui/x-charts/PieChart';
import { BarChart } from '@mui/x-charts/BarChart';
import { LineChart } from '@mui/x-charts/LineChart';

const ChargesSummary = ({ jobNo, selectedYear, jobData }) => {
  const [loading, setLoading] = useState(false);
  const [charges, setCharges] = useState(null);
  const [error, setError] = useState(null);
  const [chartType, setChartType] = useState('pie'); // Options: pie, bar, line, table

  // Instead of fetching data, we use the jobData passed from the parent component
  useEffect(() => {
    // Reset states when job number or year changes
    setError(null);
    
    // Check if we have valid job data with calculator info
    if (jobData && jobData.net_weight_calculator) {
      setCharges(jobData.net_weight_calculator);
      setLoading(false);
    } else {
      setCharges(null);
    }
  }, [jobData, jobNo, selectedYear]);

  const calculateDistribution = (charges) => {
    if (!charges) return [];
    
    // Start with the standard charges
    const standardCharges = [
      { name: 'Shipping', value: parseFloat(charges.shipping || 0), color: '#3B82F6' },
      { name: 'CFS/ICD', value: parseFloat(charges.cfs || 0), color: '#10B981' },
      { name: 'Duty', value: parseFloat(charges.duty || 0), color: '#F59E0B' },
      { name: 'Transport', value: parseFloat(charges.transport || 0), color: '#8B5CF6' },
      { name: 'Detention', value: parseFloat(charges.detention || 0), color: '#F43F5E' },
      { name: 'Labour', value: parseFloat(charges.Labour || 0), color: '#FBBF24' },
      { name: 'Custom Clearance', value: parseFloat(charges.custom_clearance_charges || 0), color: '#F472B6' }
    ];

    // Add custom fields with unique colors
    const customFieldsColors = ['#64748B', '#0EA5E9', '#14B8A6', '#A855F7', '#EC4899'];
    const customFields = charges.custom_fields?.map((field, index) => ({
      name: field.name,
      value: parseFloat(field.value || 0),
      color: customFieldsColors[index % customFieldsColors.length]
    })) || [];

    // Combine standard and custom charges, filtering out zero values
    const allCharges = [...standardCharges, ...customFields].filter(item => item.value > 0);

    const total = allCharges.reduce((sum, item) => sum + item.value, 0);
    
    return allCharges.map(item => ({
      ...item,
      percentage: total > 0 ? Math.round((item.value / total) * 100) : 0
    }));
  };

  // Function to format currency with commas for Indian rupees
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-IN').format(parseFloat(value || 0).toFixed(2));
  };

  // Get appropriate icon for each charge type
  const getChargeIcon = (label) => {
    if (label.includes('Duty')) return <AccountBalanceIcon fontSize="small" />;
    if (label.includes('Shipping')) return <LocalShippingIcon fontSize="small" />;
    if (label.includes('Custom')) return <ReceiptLongIcon fontSize="small" />;
    if (label.includes('Detention')) return <InfoOutlinedIcon fontSize="small" />;
    if (label.includes('CFS')) return <WarehouseIcon fontSize="small" />;
    if (label.includes('Transport')) return <LocalShippingOutlinedIcon fontSize="small" />;
    if (label.includes('Labour')) return <EngineeringOutlinedIcon fontSize="small" />;
    return <MoreHorizOutlinedIcon fontSize="small" />;
  };

  // Enhanced charge item component with icons and hover effect
  const ChargeItem = ({ label, value }) => {
    const formattedValue = formatCurrency(value);
    const parsedValue = parseFloat(value || 0);
    const bgColor = parsedValue > 100000 ? '#FEF2F2' : parsedValue > 10000 ? '#FEFCE8' : 'transparent';
    
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        padding: '10px 8px',
        borderBottom: '1px solid #E5E7EB',
        backgroundColor: bgColor,
        borderRadius: '4px',
        transition: 'all 0.2s ease',
        alignItems: 'center'
      }}
      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#F9FAFB'}
      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = bgColor}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <Box sx={{ color: '#64748B', mr: 1.5, display: 'flex', alignItems: 'center' }}>
            {getChargeIcon(label)}
          </Box>
          <Typography variant="body2" sx={{ color: '#4B5563', fontWeight: '500' }}>{label}</Typography>
        </div>
        
        <Tooltip 
          title={parsedValue > 0 ? `${label}: ₹${formattedValue}` : "No charge"} 
          arrow 
          placement="top"
          TransitionComponent={Fade}
          TransitionProps={{ timeout: 600 }}
        >
          <Typography 
            variant="body2" 
            fontWeight="600" 
            sx={{ 
              color: parsedValue > 50000 ? '#B91C1C' : parsedValue > 10000 ? '#B45309' : '#1E3A8A',
              minWidth: '80px',
              textAlign: 'right'
            }}
          >
            ₹{value === 0 ? '0' : formattedValue}
          </Typography>
        </Tooltip>
      </div>
    );
  };

  if (loading) {
    return (
      <Box sx={{ 
        padding: 2, 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
      }}>
        <CircularProgress size={24} sx={{ mr: 1 }} />
        <Typography>Loading charges...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Failed to load charges: {error}
      </Alert>
    );
  }

  if (!charges) {
    return (
      <Box sx={{ padding: 2, mt: 2, backgroundColor: '#F9FAFB', borderRadius: '8px' }}>
        <Typography align="center" color="textSecondary">
          No charges data available. Please search for a job first.
        </Typography>
      </Box>
    );
  }

  const distribution = calculateDistribution(charges);
  const totalCharges = distribution.reduce((sum, item) => sum + item.value, 0);

  return (
    <div style={{
      backgroundColor: '#FFFFFF',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 2px rgba(0,0,0,0.24)'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, #3B82F6, #2563EB)',
        padding: '16px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)'
      }}>
        <div style={{ 
          display: 'flex',
          alignItems: 'center',
        }}>
          <div style={{
            width: '36px',
            height: '36px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: '12px'
          }}>
            <ReceiptLongIcon style={{ color: 'white' }} />
          </div>
          <div>
            <h2 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              margin: 0,
              color: 'white'
            }}>Charges Summary Report</h2>
            <Typography 
              variant="caption" 
              sx={{ 
                color: 'rgba(255,255,255,0.85)',
                fontWeight: '500'
              }}
            >
              Job #{jobNo} • {selectedYear}
            </Typography>
          </div>
        </div>
        
        <div>
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginLeft: '10px',
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <span role="img" aria-label="print">🖨️</span>
          </button>
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            marginLeft: '10px',
            width: '32px',
            height: '32px',
            borderRadius: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
          >
            <span role="img" aria-label="download">⬇️</span>
          </button>
        </div>
      </div>
      
      <div style={{ padding: '0 16px' }}>
        <div
          style={{
            display: 'flex',
            gap: '32px',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            marginTop: '24px',
            flexWrap: 'wrap'
          }}
        >
          {/* Charges Breakdown (Left) */}
          <div style={{ flex: '1 1 320px', minWidth: '300px', maxWidth: '500px' }}>
            <div
              style={{
                padding: '16px 0',
                borderBottom: '2px solid #EEF2FF',
                display: 'flex',
                alignItems: 'center',
                position: 'relative'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#EEF2FF',
                  padding: '6px 12px',
                  borderRadius: '16px'
                }}
              >
                <Box sx={{ color: '#4F46E5', display: 'flex', alignItems: 'center', mr: 1 }}>
                  <ReceiptLongIcon fontSize="small" />
                </Box>
                <Typography variant="subtitle1" fontWeight="600" sx={{ color: '#4F46E5' }}>
                  Charges Breakdown
                </Typography>
              </div>
            </div>
            <div style={{ padding: '8px 0' }}>
              {/* <ChargeItem label="Duty Amount" value={parseFloat(charges.duty || 0) === 0 ? '0' : charges.duty} /> */}
              <ChargeItem label="Shipping Charges" value={parseFloat(charges.shipping || 0) === 0 ? '0' : charges.shipping} />
              <ChargeItem label="Custom Clearance" value={parseFloat(charges.custom_clearance_charges || 0) === 0 ? '0' : charges.custom_clearance_charges} />
              <ChargeItem label="Detention Charges" value={parseFloat(charges.detention || 0) === 0 ? '0' : charges.detention} />
              <ChargeItem label="CFS/ICD Charges" value={parseFloat(charges.cfs || 0) === 0 ? '0' : charges.cfs} />
              <ChargeItem label="Transport Charges" value={parseFloat(charges.transport || 0) === 0 ? '0' : charges.transport} />
              <ChargeItem label="Labour Charges" value={parseFloat(charges.Labour || 0) === 0 ? '0' : charges.Labour} />
              
              {/* Add custom fields to charges breakdown */}
              {charges.custom_fields?.map((field) => (
                <ChargeItem 
                  key={field.id} 
                  label={field.name} 
                  value={parseFloat(field.value || 0) === 0 ? '0' : field.value} 
                />
              ))}

              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                padding: '12px 8px',
                margin: '8px 0',
                backgroundColor: '#EEF2FF',
                borderRadius: '8px',
                border: '1px solid #E0E7FF'
              }}>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <Box
                    sx={{
                      backgroundColor: '#4F46E5',
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      
                      mr: 1.5
                    }}
                  >
                    <Box sx={{ color: 'white' }}>
                      <ReceiptLongIcon fontSize="small" />
                    </Box>
                  </Box>
                  <Typography variant="subtile2" fontWeight="200" sx={{ color: '#4338CA' }}>
                    Total Charges
                  </Typography>
                </div>
                <Typography
                  variant="subtitle2"
                  fontWeight="700"
                  sx={{
                    color: '#4F46E5',
                    backgroundColor: 'rgba(79, 70, 229, 0.1)',
                    padding: '4px 12px',
                    borderRadius: '16px'
                  }}
                >
                  ₹{formatCurrency(totalCharges)}
                </Typography>
              </div>
            </div>
          </div>

      
     {/* Cost Distribution Analysis (Right, with Multiple Chart Options) */}
     <div
 style={{
    flex: '1 1 320px',
    minWidth: '320px',
    marginTop: '24px',
    maxWidth: '600px',
    backgroundColor: '#FFFFFF',
    borderRadius: '12px',
    border: '1px solid #E5E7EB',
    padding: '24px 20px',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 4px 10px rgba(0,0,0,0.05)'
  }}
>
  <div style={{ 
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px',
    paddingBottom: '12px',
    borderBottom: '1px solid #F1F5F9'
  }}>
    <Typography
      variant="subtitle2"
      sx={{
        color: '#1E293B',
        fontWeight: '600',
        display: 'flex',
        alignItems: 'center'
      }}
    >
      <Box
        component="span"
        sx={{
          mr: 1,
          color: '#6366F1',
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#EEF2FF',
          padding: '6px',
          borderRadius: '6px'
        }}
      >
        <PieChartIcon fontSize="small" />
      </Box>
      Cost Distribution Analysis
    </Typography>
    
    {/* Chart Type Selector */}
    <ToggleButtonGroup
      value={chartType}
      exclusive
      onChange={(e, newValue) => newValue && setChartType(newValue)}
      size="small"
      aria-label="chart type selector"
      sx={{ 
        '.MuiToggleButton-root': {
          border: '1px solid #E2E8F0',
          borderRadius: '4px',
          margin: '0 2px',
          padding: '4px',
          color: '#64748B'
        },
        '.Mui-selected': {
          backgroundColor: '#EEF2FF !important',
          color: '#4F46E5 !important',
          borderColor: '#C7D2FE !important'
        }
      }}
    >
      <ToggleButton value="pie" aria-label="pie chart">
        <PieChartIcon fontSize="small" />
      </ToggleButton>
      
      <ToggleButton value="table" aria-label="table view">
        <TableChartIcon fontSize="small" />
      </ToggleButton>
    </ToggleButtonGroup>
  </div>

  {/* Chart Container with different chart types */}
<div style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center',
    flex: 1,
    position: 'relative',
    minHeight: '300px'
  }}>
    {/* Pie Chart */}
    {chartType === 'pie' && (
      <div style={{ position: 'relative', width: '450px', height: '400px' }}>
        {/* Center content for pie chart */}
        <div style={{
           position: 'absolute',
          top: '50%',
          left: '32%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          zIndex: 2,
          pointerEvents: 'none',
          width: '120px',
          height: '120px',
          display: 'flex',
          flexDirection: 'column', // Add this to stack items vertically
          alignItems: 'center',    // Center horizontally within the flex container
          justifyContent: 'center', // Center vertically
          padding: '8px',
          borderRadius: '50%',
          // backgroundColor: 'rgba(255, 255, 255, 0.9)',
          boxShadow: 'inset 0 0 8px rgba(0, 0, 0, 0.05)'
        }}>
          <Typography 
            variant="h5" 
            sx={{ 
              fontWeight: '500',
              color: '#1E293B',
              lineHeight: 1.2,
              fontSize: (value) => {
                if (totalCharges > 9999999) return '1.25rem';
                if (totalCharges > 999999) return '1.5rem';
                return '1.55rem';
              },
              // whiteSpace: 'nowrap',
              overflow: 'hidden',
              //textOverflow: 'ellipsis'
            }}
          >
            ₹{totalCharges > 999999 ? (totalCharges/1000000).toFixed(2) + 'M' : 
               totalCharges > 999 ? (totalCharges/1000).toFixed(2) + 'K' : 
               formatCurrency(totalCharges)}
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: '#64748B',
              fontSize: '0.8rem',
              marginTop: '4px'
            }}
          >
            Total Charges
          </Typography>
        </div>

        <PieChart
          series={[
            {
              data: distribution.map((item, idx) => ({
                id: idx,
                value: item.value,
                label: item.name,
                color: item.color
              })),
              innerRadius: 120,
              outerRadius: 180,
              paddingAngle: 1,
              cornerRadius: 4,
              highlightScope: { faded: 'global', highlighted: 'item' },
              arcLabel: null
            }
          ]}
          width={450}
          height={400}
          margin={{ top: 10, bottom: 10, left: 10, right: 10 }}
          legend={{ 
            hidden: false, 
            position: 'right',
            direction: 'column',
            itemMarkWidth: 12,
            itemMarkHeight: 12,
            markGap: 8,
            itemGap: 12
          }}
          sx={{
            '.MuiChartsLegend-root': { fontSize: '0.85rem' },
            '.MuiChartsLegend-item': { marginBottom: '4px' },
            '.MuiChartsLegend-mark': { borderRadius: '4px' }
          }}
          slotProps={{
            legend: {
              labelStyle: {
                fontSize: 13,
                fontWeight: 500,
                fill: '#374151',
              },
              itemGap: 10,
              labelFormatter: (item) => {
                const percent = distribution.find(d => d.name === item.label)?.percentage || 0;
                return `${item.label} (${percent}%)`;
              }
            }
          }}
        />
      </div>
    )}

 

    {/* Table View */}
    {chartType === 'table' && (
      <div style={{
        width: '100%',
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid #E2E8F0',
        borderRadius: '8px',
      }}>
        <table style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}>
          <thead>
            <tr style={{
              backgroundColor: '#F1F5F9',
              textAlign: 'left'
            }}>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0' }}>Category</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>Amount</th>
              <th style={{ padding: '12px 16px', borderBottom: '1px solid #E2E8F0', textAlign: 'right' }}>Percentage</th>
            </tr>
          </thead>
          <tbody>
            {distribution.map((item, index) => (
              <tr key={index} style={{
                borderBottom: index < distribution.length - 1 ? '1px solid #E2E8F0' : 'none',
                backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC'
              }}>
                <td style={{ 
                  padding: '10px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px' 
                }}>
                  <div style={{ 
                    width: '12px', 
                    height: '12px', 
                    backgroundColor: item.color, 
                    borderRadius: '2px' 
                  }}></div>
                  {item.name}
                </td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }}>₹{formatCurrency(item.value)}</td>
                <td style={{ padding: '10px 16px', textAlign: 'right' }}>{item.percentage}%</td>
              </tr>
            ))}
            <tr style={{
              backgroundColor: '#F1F5F9',
              fontWeight: 'bold'
            }}>
              <td style={{ padding: '12px 16px' }}>Total</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>₹{formatCurrency(totalCharges)}</td>
              <td style={{ padding: '12px 16px', textAlign: 'right' }}>100%</td>
            </tr>
          </tbody>
        </table>
      </div>
    )}
  </div>
  
  {/* Added category breakdown below the chart */}
  
</div>
        </div>
      </div>
      
      <div style={{ 
        background: 'linear-gradient(to right, #EFF6FF, #F8FAFC)', 
        padding: '24px',
        borderTop: '1px solid #E5E7EB',
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px'
      }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '20px',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          padding: '8px 16px',
          borderRadius: '30px',
          width: 'fit-content'
        }}>
          <Box sx={{ 
            color: '#3B82F6', 
            display: 'flex',
            alignItems: 'center',
            mr: 1
          }}>
            <LocalShippingIcon fontSize="small" />
          </Box>
          <Typography 
            variant="subtitle1" 
            sx={{
              fontWeight: '600',
              color: '#3B82F6'
            }}
          >
            Cost Summary
          </Typography>
        </div>
        
        <div style={{ 
          display: 'flex', 
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{ 
            flex: '1 1 200px', 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              backgroundColor: '#3B82F6'
            }}></div>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748B',
                fontWeight: '500',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
                mb: 1
              }}
            >
              Net Weight
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: '700',
                color: '#1E40AF',
                display: 'flex',
                alignItems: 'flex-end'
              }}
            >
              {formatCurrency(charges.weight || "0")}
              <Typography 
                component="span" 
                sx={{ 
                  ml: 0.5, 
                  fontSize: '1rem',
                  fontWeight: '500',
                  color: '#64748B'
                }}
              >
                kg
              </Typography>
            </Typography>
          </div>
          
          <div style={{ 
            flex: '1 1 200px', 
            backgroundColor: 'white', 
            padding: '20px', 
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)',
            transition: 'transform 0.2s ease, box-shadow 0.2s ease',
            cursor: 'pointer',
            position: 'relative',
            overflow: 'hidden'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-3px)';
            e.currentTarget.style.boxShadow = '0 10px 15px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.1)';
          }}
          >
            <div style={{ 
              position: 'absolute',
              top: 0,
              left: 0,
              width: '6px',
              height: '100%',
              backgroundColor: '#10B981'
            }}></div>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#64748B',
                fontWeight: '500',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
                mb: 1
              }}
            >
              Total Cost
            </Typography>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: '700',
                color: '#047857',
                display: 'flex',
                alignItems: 'flex-end'
              }}
            >
              ₹{formatCurrency(totalCharges)}
            </Typography>
          </div>
        </div>
        
        <div style={{ 
          marginTop: '16px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #FEFCE8, #FEF9C3)',
          padding: '20px',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05), 0 1px 3px rgba(0,0,0,0.05)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderLeft: '6px solid #F59E0B'
        }}>
          <div>
            <Typography 
              variant="body2" 
              sx={{ 
                color: '#92400E',
                fontWeight: '500',
                textTransform: 'uppercase',
                fontSize: '0.7rem',
                letterSpacing: '0.5px',
                mb: 0.5
              }}
            >
              Cost per kg
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                fontWeight: '700',
                color: '#B45309',
                display: 'flex',
                alignItems: 'flex-end'
              }}
            >
              ₹{formatCurrency(charges.net_weight_calculator?.per_kg_cost || (parseFloat(charges.weight) > 0 ? (totalCharges / parseFloat(charges.weight)) : '0'))}
              <Typography 
                component="span" 
                sx={{ 
                  ml: 0.5, 
                  fontSize: '0.875rem',
                  fontWeight: '500',
                  color: '#92400E'
                }}
              >
                per kg
              </Typography>
            </Typography>
          </div>
          
          <div style={{
            width: '48px',
            height: '48px',
            backgroundColor: 'rgba(245, 158, 11, 0.2)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box sx={{ color: '#F59E0B', display: 'flex' }}>
              <AccountBalanceIcon />
            </Box>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChargesSummary;