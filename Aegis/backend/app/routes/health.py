from fastapi import APIRouter

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health")
async def health_check():
    """
    Simple health check endpoint. Use GET.
    """
    return {"ok": True}