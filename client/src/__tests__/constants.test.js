import { describe, it, expect } from 'vitest';
import {
  CHARGE_APPLIES_TO,
  CHARGE_TIME_TYPE,
  CHARGE_CALCULATION_TYPE,
  GL_ACCOUNT_TYPE,
  GL_ACCOUNT_USAGE,
  INTEREST_COMPOUNDING,
  INTEREST_POSTING_PERIOD,
  INTEREST_CALC_TYPE,
  DAYS_IN_YEAR,
} from '../utils/constants';

describe('constants', () => {
  it('CHARGE_APPLIES_TO has Loan, Savings, and Client entries', () => {
    const labels = CHARGE_APPLIES_TO.map((c) => c.label);
    expect(labels).toContain('Loan');
    expect(labels).toContain('Savings');
    expect(labels).toContain('Client');
  });

  it('GL_ACCOUNT_TYPE has 5 types: Asset, Liability, Equity, Income, Expense', () => {
    expect(GL_ACCOUNT_TYPE).toHaveLength(5);
    const labels = GL_ACCOUNT_TYPE.map((t) => t.label);
    expect(labels).toEqual(['Asset', 'Liability', 'Equity', 'Income', 'Expense']);
  });

  it('all constants are arrays with at least one entry', () => {
    const allConstants = [
      CHARGE_APPLIES_TO,
      CHARGE_TIME_TYPE,
      CHARGE_CALCULATION_TYPE,
      GL_ACCOUNT_TYPE,
      GL_ACCOUNT_USAGE,
      INTEREST_COMPOUNDING,
      INTEREST_POSTING_PERIOD,
      INTEREST_CALC_TYPE,
      DAYS_IN_YEAR,
    ];
    allConstants.forEach((constant) => {
      expect(Array.isArray(constant)).toBe(true);
      expect(constant.length).toBeGreaterThan(0);
    });
  });

  it('each constant entry has value and label properties', () => {
    const allConstants = [
      CHARGE_APPLIES_TO,
      CHARGE_TIME_TYPE,
      CHARGE_CALCULATION_TYPE,
      GL_ACCOUNT_TYPE,
      GL_ACCOUNT_USAGE,
      INTEREST_COMPOUNDING,
      INTEREST_POSTING_PERIOD,
      INTEREST_CALC_TYPE,
      DAYS_IN_YEAR,
    ];
    allConstants.forEach((constant) => {
      constant.forEach((entry) => {
        expect(entry).toHaveProperty('value');
        expect(entry).toHaveProperty('label');
      });
    });
  });
});
