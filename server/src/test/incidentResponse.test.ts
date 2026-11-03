import { describe, it, expect } from 'vitest';
import { IncidentResponseManager, NIST_IR_STAGES } from '../simulation/incidentResponse.js';

describe('IncidentResponseManager', () => {
  it('contains all 6 NIST stages in sequential order', () => {
    const stages = IncidentResponseManager.getStages();
    expect(stages.length).toBe(6);
    expect(stages[0].stageName).toBe('Preparation');
    expect(stages[1].stageName).toBe('Detection and Analysis');
    expect(stages[2].stageName).toBe('Containment');
    expect(stages[3].stageName).toBe('Eradication');
    expect(stages[4].stageName).toBe('Recovery');
    expect(stages[5].stageName).toBe('Post-Incident Review');
  });

  it('evaluates decisions and awards points according to cybersecurity best practice', () => {
    const stage1 = NIST_IR_STAGES[0];
    const bestOption = stage1.options[0];
    const result = IncidentResponseManager.evaluateDecision(1, bestOption.id);

    expect(result.isCorrectBestPractice).toBe(true);
    expect(result.chosenOption.pointsAwarded).toBe(100);
  });

  it('generates a full scorecard with letter grade and CISO summary', () => {
    const decisions = NIST_IR_STAGES.map(s => ({
      stageNumber: s.stageNumber,
      chosenOptionId: s.options[0].id // Picking best options
    }));

    const scorecard = IncidentResponseManager.generateScorecard(decisions);

    expect(scorecard.scorePercentage).toBeGreaterThanOrEqual(90);
    expect(['A+', 'A']).toContain(scorecard.grade);
    expect(scorecard.cisoExecutiveSummary).toContain('Exemplary');
    expect(scorecard.stageResults.length).toBe(6);
  });
});
