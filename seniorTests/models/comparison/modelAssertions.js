import { compareModels } from './modelComparator.js';
import { loadComparisonRules, getRuleFor } from './modelComparisonConfig.js';

export const assertThatModels = (request, response) => new ModelAssertions(request, response);

const DEFAULT_CONFIG_PATH = 'seniorTests/config/modelRules.json';

class ModelAssertions {
  constructor(request, response) {
    this.request = request;
    this.response = response;
    this.customMappings = null;
    this.configPath = DEFAULT_CONFIG_PATH;
  }

  withMappings(mappings) {
    this.customMappings = mappings;
    return this;
  }

  useConfig(path) {
    this.configPath = path;
    return this;
  }

  async match() {
    let rules;
    if (this.configPath) {
      rules = await loadComparisonRules(this.configPath);
    }

    let fieldMappings;
    if (this.customMappings) {
      fieldMappings = this.customMappings;
    } else if (rules) {
      const rule = getRuleFor(rules, this.request.constructor?.name || 'default');
      if (!rule) {
        throw new Error(`No comparison rule found for model: ${this.request.constructor?.name}`);
      }
      fieldMappings = rule.fieldMappings;
    } else {
      throw new Error('Neither mappings nor config provided');
    }

    const result = compareModels(this.request, this.response, fieldMappings);

    if (!result.success) {
      const errorMsg = [
        'Model comparison failed:',
        ...result.mismatches.map(m => `- ${m}`) 
      ].join('\n');
      throw new Error(errorMsg);
    }
  }
}