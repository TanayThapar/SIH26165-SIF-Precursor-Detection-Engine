export type NodeType = 'Activity' | 'Location' | 'EnergySource' | 'BarrierFailure' | 'LifeSavingRule';

export interface PrecursorNode {
  id: string;
  label: string;
  type: NodeType;
  frequency: number; // raw occurrence count in dataset
  sifCorrelation: number; // correlation with high SIF potential (0-1)
  degree: number; // number of connected edges
}

export interface PrecursorEdge {
  id: string;
  source: string; // source node id
  target: string; // target node id
  coOccurrenceCount: number;
  expectedCount: number; // independent probability baseline
  lift: number; // lift = P(A & B) / (P(A) * P(B))
  confidence: number;
  associatedReportIds: string[];
}

export interface PrecursorGraphData {
  nodes: PrecursorNode[];
  edges: PrecursorEdge[];
  metadata: {
    totalEntities: number;
    timeWindow: string;
    minLiftApplied: number;
  };
}
