const VALID_SOURCES = ['Bathroom', 'Kitchen', 'Laundry', 'Mixed'];

const REQUIRED_PARAMS = [
  'pH', 'TEMP_C', 'SAL_ppt', 'TUR_NTU', 'DS_mg_L',
  'TDS_mg_L', 'TSS_mg_L', 'COND_uS_cm', 'DO_mg_L', 'BOD_mg_L',
  'COD_mg_L', 'NH4F_mg_L', 'NO3_mg_L', 'K_mg_L', 'E_coli_CFU_100mL'
];

const validateWaterSample = (req, res, next) => {
  const data = req.body;
  if (!data || typeof data !== 'object') {
    return res.status(400).json({
      success: false,
      error: 'VALIDATION_FAILED',
      message: 'Request payload must be a JSON object containing water parameters.'
    });
  }

  // Validate Source
  const source = data.Greywater_Source || data.greywater_source;
  if (!source) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_SOURCE',
      message: `Greywater_Source is required. Must be one of: ${VALID_SOURCES.join(', ')}`
    });
  }

  const matched = VALID_SOURCES.find(s => s.toLowerCase() === String(source).trim().toLowerCase());
  if (!matched) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_SOURCE',
      message: `Invalid source '${source}'. Valid sources: ${VALID_SOURCES.join(', ')}`
    });
  }
  data.Greywater_Source = matched;

  // Validate 15 Parameters
  const missing = [];
  const invalid = [];

  for (const param of REQUIRED_PARAMS) {
    if (data[param] === undefined || data[param] === null || data[param] === '') {
      missing.push(param);
    } else {
      const num = Number(data[param]);
      if (isNaN(num)) {
        invalid.push(`${param} must be a valid number`);
      } else if (param === 'pH' && (num < 0 || num > 14)) {
        invalid.push('pH must be between 0.0 and 14.0');
      } else if (num < 0) {
        invalid.push(`${param} cannot be negative`);
      } else {
        data[param] = num;
      }
    }
  }

  if (missing.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'MISSING_PARAMETERS',
      message: `Missing required water quality parameters: ${missing.join(', ')}`
    });
  }

  if (invalid.length > 0) {
    return res.status(400).json({
      success: false,
      error: 'INVALID_PARAMETERS',
      message: invalid.join('; ')
    });
  }

  next();
};

module.exports = { validateWaterSample, REQUIRED_PARAMS, VALID_SOURCES };
