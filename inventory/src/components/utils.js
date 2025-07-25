// const unitMultipliers = {
//     // Resistance
//     'mΩ': 1e-3,
//     'ohm': 1,
//     'Ω': 1,
//     'kΩ': 1e3,
//     'MΩ': 1e6,
  
//     // Capacitance
//     'pF': 1e-12,
//     'nF': 1e-9,
//     'uF': 1e-6,
//     'µF': 1e-6,
//     'mF': 1e-3,
//     'F': 1,
  
//     // Inductance
//     'nH': 1e-9,
//     'uH': 1e-6,
//     'µH': 1e-6,
//     'mH': 1e-3,
//     'H': 1
//   };
  
//   export function parseValueWithUnit(value) {
//     if (!value) return { num: NaN, multiplier: 1 };
  
//     // Match number followed by optional space and unit (e.g., 10kΩ or 10 kΩ)
//     const match = value.trim().match(/^([\d.]+)\s*([a-zA-ZµμΩ]*)$/);
//     if (!match) return { num: NaN, multiplier: 1 };
  
//     const [, numberPart, unit] = match;
//     const normalizedUnit = unit.replace('μ', 'u'); // Normalize micro symbols
  
//     const num = parseFloat(numberPart);
//     const multiplier = unitMultipliers[normalizedUnit] || 1;
  
//     return { num, multiplier };
//   }
  
//   export function compareWithUnitAware(a, b, key) {
//     const { num: numA, multiplier: mA } = parseValueWithUnit(a[key]);
//     const { num: numB, multiplier: mB } = parseValueWithUnit(b[key]);
  
//     const valA = numA * mA;
//     const valB = numB * mB;
  
//     return valA - valB;
//   }
  
const unitMultipliers = {
    // Resistance
    'mΩ': 1e-3,
    'ohm': 1,
    'Ω': 1,
    'kΩ': 1e3,
    'MΩ': 1e6,
  
    // Capacitance
    'pF': 1e-12,
    'nF': 1e-9,
    'uF': 1e-6,
    'µF': 1e-6,
    'mF': 1e-3,
    'F': 1,
  
    // Inductance
    'nH': 1e-9,
    'uH': 1e-6,
    'µH': 1e-6,
    'mH': 1e-3,
    'H': 1,
    // Voltage
    'mV': 1e-3,
    'V': 1,
    'kV': 1e3
  };
  
  function parseValueWithUnit(value) {
    if (!value) return { num: NaN, multiplier: 1 };
  
    const match = value.trim().match(/^([\d.]+)\s*([a-zA-ZμµΩ]*)$/);
    if (!match) return { num: NaN, multiplier: 1 };
  
    const [, numberPart, rawUnit] = match;
  
    const normalizedUnit = rawUnit
      .replace('μ', 'u')
      .replace('µ', 'u')
      .replace('Ω', 'ohm')
      .toLowerCase();
  
    const canonicalUnit =
      normalizedUnit === 'k' || normalizedUnit === 'kohm' ? 'kΩ' :
      normalizedUnit === 'mohm' ? 'MΩ' :
      normalizedUnit === 'm' || normalizedUnit === 'mohms' ? 'mΩ' :
      normalizedUnit === 'ohm' ? 'Ω' :
      normalizedUnit.toUpperCase();
  
    const num = parseFloat(numberPart);
    const multiplier = unitMultipliers[canonicalUnit] || 1;
  
    return { num, multiplier };
  }
  
  function compareWithUnitAware(a, b, key) {
    const { num: numA, multiplier: mA } = parseValueWithUnit(a[key]);
    const { num: numB, multiplier: mB } = parseValueWithUnit(b[key]);
  
    const valA = numA * mA;
    const valB = numB * mB;
  
    return valA - valB;
  }
  
  export { parseValueWithUnit, compareWithUnitAware };
  
  // ✅ Default export for easier import
  export default {
    parseValueWithUnit,
    compareWithUnitAware
  };
  