export class Normalizer {
  /**
   * Normalizes numeric representations (e.g., "1,200", "1.2K", "1200.00")
   */
  static parseNumber(input: string | number | null | undefined): number | null {
    if (input === null || input === undefined) return null;
    if (typeof input === 'number') return isNaN(input) ? null : input;

    let str = String(input).trim();
    if (!str) return null;

    // Handle 'k' / 'K' (e.g., 1.2K -> 1200)
    const kMatch = str.match(/^([0-9.,]+)\s*[kK]$/);
    if (kMatch) {
      const base = parseFloat(kMatch[1].replace(/,/g, ''));
      return isNaN(base) ? null : Math.round(base * 1000);
    }

    // Handle 'M' / 'm' (e.g., 1.5M -> 1500000)
    const mMatch = str.match(/^([0-9.,]+)\s*[mM]$/);
    if (mMatch) {
      const base = parseFloat(mMatch[1].replace(/,/g, ''));
      return isNaN(base) ? null : Math.round(base * 1000000);
    }

    // Remove commas, currency symbols, and spaces
    str = str.replace(/[$€£₹,]/g, '').trim();
    const val = parseFloat(str);
    return isNaN(val) ? null : val;
  }

  /**
   * Normalizes weights to standard Kilograms (KG)
   */
  static normalizeWeightToKg(value: number | string | null | undefined, unitHint?: string | null): number | null {
    if (value === null || value === undefined) return null;
    let num = typeof value === 'number' ? value : this.parseNumber(value);
    if (num === null) return null;

    const str = String(value).toLowerCase();
    const unit = (unitHint || str).toLowerCase();

    if (unit.includes('mt') || unit.includes('metric ton') || unit.includes('tonne')) {
      return num * 1000;
    }
    if (unit.includes('gram') || unit.includes(' gm') || unit.endsWith('g')) {
      return num / 1000;
    }
    if (unit.includes('lb') || unit.includes('pound')) {
      return Math.round(num * 0.45359237 * 100) / 100;
    }
    return num; // Default assumes KG
  }

  /**
   * Normalizes currencies to ISO standard codes
   */
  static normalizeCurrency(currency: string | null | undefined): string {
    if (!currency) return 'USD';
    const c = currency.trim().toUpperCase();
    if (c === '$' || c.includes('DOLLAR') || c === 'USD') return 'USD';
    if (c === '€' || c.includes('EURO') || c === 'EUR') return 'EUR';
    if (c === '₹' || c.includes('RUPEE') || c.includes('INR')) return 'INR';
    if (c === '£' || c.includes('POUND') || c === 'GBP') return 'GBP';
    if (c.includes('AED') || c.includes('DIRHAM')) return 'AED';
    if (c.includes('SGD')) return 'SGD';
    if (c.includes('JPY') || c === '¥') return 'JPY';
    return c.slice(0, 3);
  }

  /**
   * Normalizes packaging/quantity units
   */
  static normalizeUnit(unit: string | null | undefined): string {
    if (!unit) return 'UNITS';
    const u = unit.trim().toUpperCase();
    if (u.includes('CTN') || u.includes('CARTON') || u.includes('BOX') || u.includes('PACKAGE') || u.includes('PKG')) {
      return 'CARTONS';
    }
    if (u.includes('KG') || u.includes('KILO')) return 'KG';
    if (u.includes('MT') || u.includes('TON')) return 'MT';
    if (u.includes('PC') || u.includes('PIECE')) return 'PCS';
    if (u.includes('BAG')) return 'BAGS';
    if (u.includes('PALLET') || u.includes('PLT')) return 'PALLETS';
    return u;
  }

  /**
   * Normalizes HS code (e.g. "0904.11.10" -> "09041110")
   */
  static normalizeHsCode(code: string | null | undefined): string {
    if (!code) return '';
    return code.replace(/[^0-9]/g, '');
  }

  /**
   * Normalizes dates into standard ISO YYYY-MM-DD
   */
  static normalizeDate(dateStr: string | null | undefined): string | null {
    if (!dateStr) return null;
    try {
      const clean = dateStr.trim();
      // Handle DD-MM-YYYY or DD-Mon-YYYY
      const d = new Date(clean);
      if (!isNaN(d.getTime())) {
        return d.toISOString().split('T')[0];
      }
      return clean;
    } catch {
      return dateStr;
    }
  }

  /**
   * Cleans company and port names for semantic comparison
   */
  static normalizeEntityName(name: string | null | undefined): string {
    if (!name) return '';
    return name
      .toLowerCase()
      .replace(/\b(pvt|ltd|llc|inc|corp|co|bv|b\.v\.|gmbh|sa)\b/gi, '')
      .replace(/[^a-z0-9]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }
}
