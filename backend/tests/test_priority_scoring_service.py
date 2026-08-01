import pytest
from datetime import date, timedelta
from src.services.priority_scoring_service import PriorityScoringService

class MockProject:
    def __init__(self, **kwargs):
        for k, v in kwargs.items():
            setattr(self, k, v)


def test_calculate_urgency_score():
    today = date.today()
    
    # No target date -> 0
    assert PriorityScoringService.calculate_urgency_score(None) == 0.0
    
    # Past due -> 1.0
    past = today - timedelta(days=5)
    assert PriorityScoringService.calculate_urgency_score(past) == 1.0
    
    # Today -> 1.0
    assert PriorityScoringService.calculate_urgency_score(today) == 1.0
    
    # Far future (>365 days) -> 0.0
    far_future = today + timedelta(days=400)
    assert PriorityScoringService.calculate_urgency_score(far_future) == 0.0
    
    # Middle of year
    mid_year = today + timedelta(days=182)
    score = PriorityScoringService.calculate_urgency_score(mid_year)
    assert 0.4 <= score <= 0.6  # approx 0.5


def test_get_health_score():
    assert PriorityScoringService.get_health_score("blocked") == 1.0
    assert PriorityScoringService.get_health_score("at_risk") == 0.5
    assert PriorityScoringService.get_health_score("no_next_step") == 0.2
    assert PriorityScoringService.get_health_score("ok") == 0.0
    assert PriorityScoringService.get_health_score("unknown") == 0.0


def test_calculate_score_absolute():
    project = MockProject(priority_strategy="absolute", priority_constant=42.5)
    assert PriorityScoringService.calculate_score(project) == 42.5


def test_calculate_score_relative():
    today = date.today()
    # Urgency ~0.5, business_value = 10
    mid_year = today + timedelta(days=182)
    project = MockProject(
        priority_strategy="relative", 
        fecha_limite=mid_year,
        business_value=10.0
    )
    score = PriorityScoringService.calculate_score(project)
    urgency = PriorityScoringService.calculate_urgency_score(mid_year)
    assert score == urgency * 10.0


def test_calculate_score_mixed():
    today = date.today()
    project = MockProject(
        priority_strategy="mixed",
        fecha_limite=today,  # urgency = 1.0 -> weight 0.25
        business_value=10.0, # normalized = 1.0 -> weight 0.25
        health_status="blocked" # health = 1.0 -> weight 0.3
    )
    # Critical tasks count = 5 -> normalized 1.0 -> weight 0.2
    # Total score should be 1.0
    score = PriorityScoringService.calculate_score(project, critical_tasks_count=5)
    assert score == 1.0
    
    # Score with 0 critical tasks -> 0.8
    score2 = PriorityScoringService.calculate_score(project, critical_tasks_count=0)
    assert score2 == 0.8
