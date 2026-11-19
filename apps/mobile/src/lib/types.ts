export interface GeoJsonPolygon {
  type: 'Polygon' | 'MultiPolygon';
  coordinates: number[][][] | number[][][][];
}

export interface Property {
  id: string;
  carCode: string;
  name: string;
  municipality: string;
  state: string;
  ownerName: string;
  fiscalModules: number | null;
  declaredAreaHa: number;
  declaredArea: GeoJsonPolygon;
}

export type NotificationKind = 'overlap' | 'legal_reserve' | 'permanent_preservation' | 'documents' | 'dynamic_rectification' | 'other';

export interface CarNotification {
  id: string;
  propertyId: string;
  externalCode: string;
  issuedBy: string;
  issuedAt: string;
  dueDate: string | null;
  kind: NotificationKind;
  originalText: string;
  status: 'pending' | 'in_progress' | 'answered';
}

export interface Explanation {
  summary: string;
  steps: string[];
  documents: string[];
  deadline: string | null;
  sources: string[];
  audioScript: string;
}

export interface ExplanationResponse {
  explanation: Explanation;
  disclaimer: string;
  provider: string;
  cached: boolean;
}

export interface SurveyPoint {
  latitude: number;
  longitude: number;
  accuracy: number | null;
  timestamp: number;
}

export interface NeighbourOverlap {
  propertyId: string;
  carCode: string;
  name: string;
  declaredOverlapHa: number;
  surveyedOverlapHa: number;
  declaredOverlap: GeoJsonPolygon | null;
  suggestion: 'correct_boundary' | 'gather_documents' | 'talk_to_neighbour';
}

export interface SurveyAnalysis {
  surveyId: string;
  propertyId: string;
  declaredAreaHa: number;
  surveyedAreaHa: number;
  surveyedOutsideDeclaredHa: number;
  declaredOutsideSurveyedHa: number;
  accuracyAvgM: number | null;
  declaredArea: GeoJsonPolygon;
  surveyedArea: GeoJsonPolygon;
  neighbours: NeighbourOverlap[];
}

export const KIND_LABEL: Record<NotificationKind, string> = {
  overlap: 'Sobreposição com vizinho',
  legal_reserve: 'Reserva Legal',
  permanent_preservation: 'Área de Preservação Permanente (APP)',
  documents: 'Documentos pendentes',
  dynamic_rectification: 'Retificação Dinamizada',
  other: 'Outra pendência',
};
