/**
 * Lightweight frontend validation helpers.
 * Each validate* function returns an object: { valid: boolean, errors: {field: message} }
 */

export function validateExtractionForm(values) {
  const errors = {};
  if (!values.hiveId) errors.hiveId = "Hive is required.";
  if (!values.quantity || Number(values.quantity) <= 0) errors.quantity = "Quantity must be greater than 0.";
  if (!values.extractionDate) errors.extractionDate = "Extraction date is required.";
  if (!values.honeyType) errors.honeyType = "Honey type is required.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSampleRequest(values) {
  const errors = {};
  if (!values.batchId) errors.batchId = "Batch is required.";
  if (!values.labId) errors.labId = "Laboratory is required.";
  if (!values.sampleQuantity || Number(values.sampleQuantity) <= 0) errors.sampleQuantity = "Sample quantity is required.";
  if (!values.tests || values.tests.length === 0) errors.tests = "Select at least one test.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validatePurityAnalysis(values) {
  const errors = {};
  if (!values.testStatus) errors.testStatus = "Overall result (PASS/FAIL) is required.";
  if (values.moisture === "" || values.moisture === undefined) errors.moisture = "Moisture is required.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateCertificateIssue(values) {
  const errors = {};
  if (!values.certificateId) errors.certificateId = "Certificate ID is required.";
  if (!values.file) errors.file = "A report file must be attached.";
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateSignup(values) {
  const errors = {};
  if (!values.fullName) errors.fullName = "Full name is required.";
  if (!values.email) errors.email = "Email is required.";
  if (!values.password || values.password.length < 6) errors.password = "Password must be at least 6 characters.";
  if (values.password !== values.confirmPassword) errors.confirmPassword = "Passwords do not match.";
  if (!values.roles || values.roles.length === 0) errors.roles = "Select at least one activity/role.";
  return { valid: Object.keys(errors).length === 0, errors };
}
