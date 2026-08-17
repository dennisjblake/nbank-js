export const compareModels = (request, response, fieldMap) => {
  const mismatches = [];

  for (const [reqField, resField] of Object.entries(fieldMap)) {
    const reqValue = getNestedField(request, reqField);
    const resValue = getNestedField(response, resField);

    if (String(reqValue) !== String(resValue)) {
      mismatches.push({
        field: `${reqField} → ${resField}`, 
        expected: reqValue,                 
        actual: resValue,                   
        toString() {                       
          return `[${this.field}] Expected: ${this.expected}, Actual: ${this.actual}`;
        }
      });
    }
  }

  return {
    success: mismatches.length === 0,
    mismatches
  };
};

const getNestedField = (obj, path) => {
  return path.split('.').reduce((acc, key) => {
    return acc?.[key];
  }, obj);
};