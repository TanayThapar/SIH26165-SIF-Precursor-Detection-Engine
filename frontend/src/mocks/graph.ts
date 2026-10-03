import { PrecursorGraphData } from '../types/graph';

export const MOCK_PRECURSOR_GRAPH: PrecursorGraphData = {
  metadata: {
    totalEntities: 24,
    timeWindow: 'Past 90 Days Rolling',
    minLiftApplied: 1.5,
  },
  nodes: [
    // Activities
    { id: 'act-lift', label: 'Mechanical Hoisting', type: 'Activity', frequency: 78, sifCorrelation: 0.88, degree: 5 },
    { id: 'act-loto', label: 'Electrical Isolation', type: 'Activity', frequency: 54, sifCorrelation: 0.86, degree: 4 },
    { id: 'act-cs', label: 'Vessel Entry', type: 'Activity', frequency: 38, sifCorrelation: 0.92, degree: 4 },
    { id: 'act-height', label: 'Derrick / Scaffold Work', type: 'Activity', frequency: 62, sifCorrelation: 0.89, degree: 4 },
    { id: 'act-hot', label: 'Hot Work / Welding', type: 'Activity', frequency: 49, sifCorrelation: 0.82, degree: 3 },
    { id: 'act-simops', label: 'SIMOPS Operations', type: 'Activity', frequency: 32, sifCorrelation: 0.91, degree: 5 },

    // Energy Sources
    { id: 'en-grav', label: 'Gravity (>3m / >500kg)', type: 'EnergySource', frequency: 95, sifCorrelation: 0.91, degree: 6 },
    { id: 'en-volt', label: 'High Voltage (>440V)', type: 'EnergySource', frequency: 42, sifCorrelation: 0.89, degree: 3 },
    { id: 'en-chem', label: 'Toxic H2S / Flammables', type: 'EnergySource', frequency: 48, sifCorrelation: 0.94, degree: 4 },
    { id: 'en-press', label: 'High Pressure (>1000 PSI)', type: 'EnergySource', frequency: 44, sifCorrelation: 0.85, degree: 3 },
    { id: 'en-mech', label: 'Stored Tension / Spring', type: 'EnergySource', frequency: 36, sifCorrelation: 0.83, degree: 3 },

    // Barrier Failures
    { id: 'bf-ez', label: 'Missing Exclusion Zone', type: 'BarrierFailure', frequency: 45, sifCorrelation: 0.92, degree: 4 },
    { id: 'bf-loto', label: 'Bypassed LOTO / Shutter', type: 'BarrierFailure', frequency: 34, sifCorrelation: 0.90, degree: 4 },
    { id: 'bf-gas', label: 'Omitted 4-Gas Test', type: 'BarrierFailure', frequency: 28, sifCorrelation: 0.95, degree: 3 },
    { id: 'bf-tie', label: 'Unclipped Fall Arrest', type: 'BarrierFailure', frequency: 31, sifCorrelation: 0.93, degree: 3 },
    { id: 'bf-ptw', label: 'Permit Scope Mismatch', type: 'BarrierFailure', frequency: 39, sifCorrelation: 0.84, degree: 4 },

    // Life-Saving Rules
    { id: 'lsr-lift', label: 'Safe Mechanical Lifting', type: 'LifeSavingRule', frequency: 72, sifCorrelation: 0.89, degree: 5 },
    { id: 'lsr-line', label: 'Line of Fire', type: 'LifeSavingRule', frequency: 86, sifCorrelation: 0.91, degree: 6 },
    { id: 'lsr-loto', label: 'Energy Isolation', type: 'LifeSavingRule', frequency: 58, sifCorrelation: 0.88, degree: 5 },
    { id: 'lsr-cs', label: 'Confined Space', type: 'LifeSavingRule', frequency: 35, sifCorrelation: 0.93, degree: 4 },
    { id: 'lsr-hgt', label: 'Working at Height', type: 'LifeSavingRule', frequency: 56, sifCorrelation: 0.90, degree: 4 },
    { id: 'lsr-hot', label: 'Hot Work', type: 'LifeSavingRule', frequency: 41, sifCorrelation: 0.84, degree: 3 },
    { id: 'lsr-byp', label: 'Bypassing Safety Controls', type: 'LifeSavingRule', frequency: 65, sifCorrelation: 0.89, degree: 6 },
  ],
  edges: [
    // High-lift co-occurrences
    { id: 'e-1', source: 'act-lift', target: 'en-grav', coOccurrenceCount: 46, expectedCount: 14.8, lift: 3.11, confidence: 0.88, associatedReportIds: ['OIL-2026-0814', 'OIL-2026-0780', 'OIL-2026-0938'] },
    { id: 'e-2', source: 'act-lift', target: 'bf-ez', coOccurrenceCount: 32, expectedCount: 7.2, lift: 4.44, confidence: 0.85, associatedReportIds: ['OIL-2026-0814', 'OIL-2026-0938'] },
    { id: 'e-3', source: 'bf-ez', target: 'lsr-line', coOccurrenceCount: 38, expectedCount: 8.1, lift: 4.69, confidence: 0.92, associatedReportIds: ['OIL-2026-0814', 'OIL-2026-0955'] },
    { id: 'e-4', source: 'en-grav', target: 'lsr-line', coOccurrenceCount: 52, expectedCount: 16.4, lift: 3.17, confidence: 0.89, associatedReportIds: ['OIL-2026-0814', 'OIL-2026-0938'] },
    { id: 'e-5', source: 'act-loto', target: 'en-volt', coOccurrenceCount: 30, expectedCount: 6.8, lift: 4.41, confidence: 0.91, associatedReportIds: ['OIL-2026-0819'] },
    { id: 'e-6', source: 'act-loto', target: 'bf-loto', coOccurrenceCount: 26, expectedCount: 5.4, lift: 4.81, confidence: 0.89, associatedReportIds: ['OIL-2026-0819', 'OIL-2026-0902'] },
    { id: 'e-7', source: 'bf-loto', target: 'lsr-byp', coOccurrenceCount: 29, expectedCount: 6.2, lift: 4.67, confidence: 0.94, associatedReportIds: ['OIL-2026-0819', 'OIL-2026-0902'] },
    { id: 'e-8', source: 'act-cs', target: 'en-chem', coOccurrenceCount: 28, expectedCount: 5.1, lift: 5.49, confidence: 0.95, associatedReportIds: ['OIL-2026-0824', 'OIL-2026-0805'] },
    { id: 'e-9', source: 'act-cs', target: 'bf-gas', coOccurrenceCount: 24, expectedCount: 3.9, lift: 6.15, confidence: 0.96, associatedReportIds: ['OIL-2026-0824', 'OIL-2026-0805'] },
    { id: 'e-10', source: 'bf-gas', target: 'lsr-cs', coOccurrenceCount: 22, expectedCount: 3.2, lift: 6.87, confidence: 0.98, associatedReportIds: ['OIL-2026-0824', 'OIL-2026-0805'] },
    { id: 'e-11', source: 'act-height', target: 'en-grav', coOccurrenceCount: 42, expectedCount: 11.8, lift: 3.56, confidence: 0.90, associatedReportIds: ['OIL-2026-0842', 'OIL-2026-0947', 'OIL-2026-0799'] },
    { id: 'e-12', source: 'act-height', target: 'bf-tie', coOccurrenceCount: 25, expectedCount: 5.3, lift: 4.71, confidence: 0.91, associatedReportIds: ['OIL-2026-0842', 'OIL-2026-0799'] },
    { id: 'e-13', source: 'bf-tie', target: 'lsr-hgt', coOccurrenceCount: 28, expectedCount: 4.8, lift: 5.83, confidence: 0.96, associatedReportIds: ['OIL-2026-0842', 'OIL-2026-0799'] },
    { id: 'e-14', source: 'act-simops', target: 'bf-ptw', coOccurrenceCount: 21, expectedCount: 4.1, lift: 5.12, confidence: 0.88, associatedReportIds: ['OIL-2026-0855', 'OIL-2026-0914'] },
    { id: 'e-15', source: 'act-simops', target: 'act-hot', coOccurrenceCount: 18, expectedCount: 4.2, lift: 4.28, confidence: 0.82, associatedReportIds: ['OIL-2026-0855', 'OIL-2026-0914'] },
    { id: 'e-16', source: 'act-hot', target: 'en-chem', coOccurrenceCount: 23, expectedCount: 5.9, lift: 3.89, confidence: 0.84, associatedReportIds: ['OIL-2026-0855', 'OIL-2026-0785'] },
    { id: 'e-17', source: 'act-hot', target: 'lsr-hot', coOccurrenceCount: 32, expectedCount: 6.8, lift: 4.70, confidence: 0.93, associatedReportIds: ['OIL-2026-0855', 'OIL-2026-0785'] },
    { id: 'e-18', source: 'en-press', target: 'lsr-line', coOccurrenceCount: 26, expectedCount: 7.9, lift: 3.29, confidence: 0.86, associatedReportIds: ['OIL-2026-0831', 'OIL-2026-0955'] },
    { id: 'e-19', source: 'en-mech', target: 'lsr-line', coOccurrenceCount: 22, expectedCount: 6.4, lift: 3.43, confidence: 0.84, associatedReportIds: ['OIL-2026-0925', 'OIL-2026-0780'] },
    { id: 'e-20', source: 'bf-ptw', target: 'lsr-byp', coOccurrenceCount: 25, expectedCount: 5.8, lift: 4.31, confidence: 0.89, associatedReportIds: ['OIL-2026-0855', 'OIL-2026-0914'] },
  ]
};
