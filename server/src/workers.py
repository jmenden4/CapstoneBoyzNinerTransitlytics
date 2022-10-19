from uvicorn.workers import UvicornWorker

class ConfigurableWorker(UvicornWorker):
    CONFIG_KWARGS = {
        "root_path": "/api",
    }