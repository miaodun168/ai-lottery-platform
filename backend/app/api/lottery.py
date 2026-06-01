from fastapi import APIRouter

router = APIRouter()


@router.get("/")
def list_lotteries():
    return []


@router.post("/draw")
def draw():
    return {"result": None}
