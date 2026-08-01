from datetime import date
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.db_models import Project


class PriorityScoringService:
    @staticmethod
    def calculate_urgency_score(target_date: date | None) -> float:
        if not target_date:
            return 0.0
        
        days_to_deadline = (target_date - date.today()).days
        if days_to_deadline <= 0:
            return 1.0
        
        if days_to_deadline > 365:
            return 0.0
            
        return 1.0 - (days_to_deadline / 365.0)

    @staticmethod
    def get_health_score(health_status: str) -> float:
        mapping = {
            "blocked": 1.0,
            "at_risk": 0.5,
            "no_next_step": 0.2,
            "ok": 0.0
        }
        return mapping.get(health_status, 0.0)

    @staticmethod
    def calculate_score(project: "Project", critical_tasks_count: int = 0) -> float:
        """
        Calculate priority score based on the chosen strategy (ADR 007).
        Higher score means higher priority.
        """
        strategy = getattr(project, "priority_strategy", "relative")
        
        if strategy == "absolute":
            return float(getattr(project, "priority_constant", 0.0))
            
        business_value = float(getattr(project, "business_value", 0.0))
        urgency_score = PriorityScoringService.calculate_urgency_score(project.fecha_limite)
        
        if strategy == "relative":
            # Simple relative: urgency * business_value
            return urgency_score * business_value
            
        elif strategy == "mixed":
            health_weight = 0.3
            urgency_weight = 0.25
            value_weight = 0.25
            critical_weight = 0.2
            
            health_score = PriorityScoringService.get_health_score(getattr(project, "health_status", "ok"))
            normalized_business_value = min(10.0, max(0.0, business_value)) / 10.0
            
            # Temporary mock for critical tasks until EP-004
            normalized_critical_tasks = min(1.0, critical_tasks_count / 5.0) if critical_tasks_count > 0 else 0.0
            
            score = (
                (health_score * health_weight) +
                (urgency_score * urgency_weight) +
                (normalized_business_value * value_weight) +
                (normalized_critical_tasks * critical_weight)
            )
            return round(score, 3)
            
        return 0.0

