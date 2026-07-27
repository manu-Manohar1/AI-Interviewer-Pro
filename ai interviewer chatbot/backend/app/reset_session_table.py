from sqlalchemy import text
from app.database import Base, engine

# Explicitly import models so Base metadata is populated
import app.models
import app.models_interview
import app.models_session


def reset_tables():
    print("Dropping all tables with CASCADE...")
    with engine.begin() as conn:
        conn.execute(text("DROP SCHEMA public CASCADE;"))
        conn.execute(text("CREATE SCHEMA public;"))

    print("Re-creating all database tables with updated schemas...")
    Base.metadata.create_all(bind=engine)
    print("Success! Database reset completely.")


if __name__ == "__main__":
    reset_tables()