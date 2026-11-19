import { InvalidSurveyError, surveyToPolygonWkt } from './survey-geometry';

const p = (longitude: number, latitude: number, timestamp: number, accuracy: number | null = 5) => ({ latitude, longitude, accuracy, timestamp });

describe('surveyToPolygonWkt', () => {
  it('closes the ring and orders points by time', () => {
    const { wkt, accuracyAvg } = surveyToPolygonWkt([p(1, 1, 3), p(0, 0, 1), p(1, 0, 2), p(0, 1, 4)]);
    expect(wkt).toBe('POLYGON((0 0,1 0,1 1,0 1,0 0))');
    expect(accuracyAvg).toBe(5);
  });

  it('drops imprecise points and rejects surveys that become too small', () => {
    expect(() => surveyToPolygonWkt([p(0, 0, 1), p(1, 0, 2), p(1, 1, 3, 80), p(0, 1, 4)])).toThrow(InvalidSurveyError);
  });
});
