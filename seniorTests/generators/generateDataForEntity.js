import RandExp from 'randexp';

export const generateDataForEntity = (model) => {
  const generateData = {};
  for (const field in model) {
    const fieldType = model[field].type;
    const fieldRules = model[field];

    if (fieldRules.default !== undefined) {
      generateData[field] = field.default;
      continue;
    }

    if (fieldType === 'string') {
      if (fieldRules.regex) {
        generateData[field] = new RandExp(fieldRules.regex).gen();
      } else {
        generateData[field] = Math.random().toString(36).substring(7);
      }
    } else if (fieldType === 'number') {
      const min = fieldRules.min || 0;
      const max = fieldRules.max || 100;
      generateData[field] = Math.floor(Math.random() * (max - min + 1)) + min;
    } else if (fieldType === 'boolean') {
      generateData[field] = Math.random() < 0.5;
    }
  }

  return generateData;
};
