# app package
try:
    from . import models
    from . import models_resume
    from . import models_interview
    from . import models_session
except Exception:
    # Allow importing router modules in lightweight environments such as tests.
    pass
