from typing import List, Optional
from uuid import UUID
from sqlalchemy import select, func, desc, case
from sqlalchemy.ext.asyncio import AsyncSession

from repositories.base import BaseRepository
from models.admin import AuditLog, AdminAction, SystemMetric, AIUsageMetric


class AuditLogRepository(BaseRepository[AuditLog]):
    def __init__(self, db: AsyncSession):
        super().__init__(AuditLog, db)

    async def get_logs(
        self, *, skip: int = 0, limit: int = 100, action_type: Optional[str] = None, user_id: Optional[UUID] = None
    ) -> List[AuditLog]:
        query = select(AuditLog)
        if action_type:
            query = query.where(AuditLog.action_type == action_type)
        if user_id:
            query = query.where(AuditLog.user_id == user_id)
        query = query.order_by(desc(AuditLog.created_at)).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def count_logs(self, *, action_type: Optional[str] = None, user_id: Optional[UUID] = None) -> int:
        query = select(func.count(AuditLog.id))
        if action_type:
            query = query.where(AuditLog.action_type == action_type)
        if user_id:
            query = query.where(AuditLog.user_id == user_id)
        result = await self.db.execute(query)
        return result.scalar() or 0


class AdminActionRepository(BaseRepository[AdminAction]):
    def __init__(self, db: AsyncSession):
        super().__init__(AdminAction, db)

    async def get_actions(
        self, *, skip: int = 0, limit: int = 100, admin_id: Optional[UUID] = None, target_user_id: Optional[UUID] = None
    ) -> List[AdminAction]:
        query = select(AdminAction)
        if admin_id:
            query = query.where(AdminAction.admin_id == admin_id)
        if target_user_id:
            query = query.where(AdminAction.target_user_id == target_user_id)
        query = query.order_by(desc(AdminAction.created_at)).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())


class SystemMetricRepository(BaseRepository[SystemMetric]):
    def __init__(self, db: AsyncSession):
        super().__init__(SystemMetric, db)

    async def get_recent_metrics(self, *, limit: int = 50) -> List[SystemMetric]:
        query = select(SystemMetric).order_by(desc(SystemMetric.created_at)).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())


class AIUsageMetricRepository(BaseRepository[AIUsageMetric]):
    def __init__(self, db: AsyncSession):
        super().__init__(AIUsageMetric, db)

    async def get_usage(
        self, *, skip: int = 0, limit: int = 100, provider: Optional[str] = None, user_id: Optional[UUID] = None
    ) -> List[AIUsageMetric]:
        query = select(AIUsageMetric)
        if provider:
            query = query.where(AIUsageMetric.provider == provider)
        if user_id:
            query = query.where(AIUsageMetric.user_id == user_id)
        query = query.order_by(desc(AIUsageMetric.created_at)).offset(skip).limit(limit)
        result = await self.db.execute(query)
        return list(result.scalars().all())

    async def get_aggregate_stats(self) -> dict:
        """
        Calculates sums and averages of AI tokens, cost, and latency.
        """
        query = select(
            func.sum(AIUsageMetric.input_tokens).label("total_input_tokens"),
            func.sum(AIUsageMetric.output_tokens).label("total_output_tokens"),
            func.sum(AIUsageMetric.cost_estimate).label("total_cost"),
            func.avg(AIUsageMetric.latency_ms).label("avg_latency"),
            func.count(AIUsageMetric.id).label("total_requests"),
            func.sum(case((AIUsageMetric.status_code >= 400, 1), else_=0)).label("failed_requests")
        )
        result = await self.db.execute(query)
        row = result.first()
        if not row or not row[4]:  # If total_requests is 0 or None
            return {
                "total_input_tokens": 0,
                "total_output_tokens": 0,
                "total_cost": 0.0,
                "avg_latency": 0.0,
                "total_requests": 0,
                "failed_requests": 0,
                "failure_rate": 0.0
            }
        
        total_reqs = row.total_requests or 0
        failed_reqs = row.failed_requests or 0
        failure_rate = (failed_reqs / total_reqs) * 100 if total_reqs > 0 else 0.0

        return {
            "total_input_tokens": int(row.total_input_tokens or 0),
            "total_output_tokens": int(row.total_output_tokens or 0),
            "total_cost": float(row.total_cost or 0.0),
            "avg_latency": float(row.avg_latency or 0.0),
            "total_requests": int(total_reqs),
            "failed_requests": int(failed_reqs),
            "failure_rate": float(failure_rate)
        }
