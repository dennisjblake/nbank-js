import fs from 'fs/promises';

const configCache = new Map();

export const loadComparisonRules = async (filePath) => {
  if (configCache.has(filePath)) {
    return configCache.get(filePath);
  }

  let rawData;
  try {
    rawData = await fs.readFile(filePath, 'utf-8');
  } catch (err) {
    throw new Error(`Config file not found: ${filePath}`);
  }

  const rules = parseConfig(JSON.parse(rawData));

  configCache.set(filePath, rules);
  return rules;
};

const parseConfig = (rawConfig) => {
  const rules = new Map();

  for (const [requestClass, ruleConfig] of Object.entries(rawConfig)) {
    if (!ruleConfig?.target || !ruleConfig?.fields) {
      console.warn(`Invalid rule for ${requestClass}: skipped`);
      continue;
    }

    const fieldMappings = ruleConfig.fields.reduce((map, fieldRule) => {
      const [reqField, resField = reqField] = fieldRule.split('=').map(s => s.trim());
      map[reqField] = resField;
      return map;
    }, {});

    rules.set(requestClass, {
      target: ruleConfig.target,  
      fieldMappings,             
      toString() {             
        return `Rule for ${requestClass} → ${this.target}`;
      }
    });
  }

  return Object.freeze(rules); 
};

export const getRuleFor = (rules, requestClassName) => {
  return rules.get(requestClassName) ?? null;
};