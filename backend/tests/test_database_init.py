"""
Test database initialization functionality.
Validates that init.sql is properly executed when tables don't exist.
"""
import pytest
from pathlib import Path
from unittest.mock import AsyncMock, MagicMock, patch, mock_open


class TestDatabaseInitialization:
    """Test suite for database initialization logic."""
    
    @pytest.mark.asyncio
    async def test_init_sql_path_resolution_shared(self):
        """Test that init.sql path is correctly resolved from shared/database.py"""
        from app.shared.database import INIT_SQL_PATH
        
        # The constant should point to a valid init.sql file
        assert INIT_SQL_PATH.exists(), f"init.sql should exist at {INIT_SQL_PATH}"
        assert INIT_SQL_PATH.name == "init.sql", "Path should point to init.sql file"
    
    @pytest.mark.asyncio
    async def test_init_sql_path_resolution_root(self):
        """Test that init.sql path is correctly resolved from database.py"""
        from app.database import INIT_SQL_PATH
        
        # The constant should point to a valid init.sql file
        assert INIT_SQL_PATH.exists(), f"init.sql should exist at {INIT_SQL_PATH}"
        assert INIT_SQL_PATH.name == "init.sql", "Path should point to init.sql file"
    
    @pytest.mark.asyncio
    async def test_both_database_files_resolve_to_same_path(self):
        """Test that both database files resolve to the same init.sql"""
        from app.shared.database import INIT_SQL_PATH as shared_path
        from app.database import INIT_SQL_PATH as db_path
        
        # Both should resolve to the same file
        assert shared_path == db_path, f"Paths should be identical: {shared_path} vs {db_path}"
    
    @pytest.mark.asyncio
    async def test_init_database_tables_exist(self):
        """Test init_database when tables already exist."""
        from app.shared.database import init_database
        
        # Mock pool with a connection that reports tables exist
        mock_pool = MagicMock()
        mock_conn = AsyncMock()
        mock_conn.fetchval = AsyncMock(return_value=True)  # Tables exist
        mock_conn.execute = AsyncMock()  # Add execute mock
        mock_pool.acquire = MagicMock()
        mock_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=None)
        
        # Should not raise any errors
        await init_database(mock_pool)
        
        # Verify fetchval was called to check for tables
        mock_conn.fetchval.assert_called_once()
        # execute should NOT be called since tables exist
        mock_conn.execute.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_init_database_tables_not_exist(self):
        """Test init_database when tables don't exist - should execute init.sql."""
        from app.shared.database import init_database
        
        # Mock pool with a connection that reports tables don't exist
        mock_pool = MagicMock()
        mock_conn = AsyncMock()
        mock_conn.fetchval = AsyncMock(return_value=False)  # Tables don't exist
        mock_conn.execute = AsyncMock(return_value=None)  # Execute init.sql
        mock_pool.acquire = MagicMock()
        mock_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=None)
        
        # Mock file reading
        init_sql_content = "CREATE TABLE facilities (id TEXT PRIMARY KEY);"
        
        with patch('builtins.open', mock_open(read_data=init_sql_content)):
            with patch('pathlib.Path.exists', return_value=True):
                await init_database(mock_pool)
        
        # Verify fetchval was called to check for tables
        mock_conn.fetchval.assert_called_once()
        # execute should be called with SQL content
        mock_conn.execute.assert_called_once_with(init_sql_content)
    
    @pytest.mark.asyncio
    async def test_init_database_missing_init_sql(self):
        """Test init_database when init.sql file doesn't exist."""
        from app.shared.database import init_database
        
        # Mock pool with a connection that reports tables don't exist
        mock_pool = MagicMock()
        mock_conn = AsyncMock()
        mock_conn.fetchval = AsyncMock(return_value=False)  # Tables don't exist
        mock_conn.execute = AsyncMock()  # Add execute mock
        mock_pool.acquire = MagicMock()
        mock_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=None)
        
        # Mock that init.sql doesn't exist
        with patch('pathlib.Path.exists', return_value=False):
            # Should return early without error
            await init_database(mock_pool)
        
        # Verify execute was NOT called since file doesn't exist
        mock_conn.execute.assert_not_called()
    
    @pytest.mark.asyncio
    async def test_init_database_sql_execution_error(self):
        """Test init_database handles SQL execution errors properly."""
        from app.shared.database import init_database
        
        # Mock pool with a connection that reports tables don't exist
        mock_pool = MagicMock()
        mock_conn = AsyncMock()
        mock_conn.fetchval = AsyncMock(return_value=False)  # Tables don't exist
        mock_conn.execute = AsyncMock(side_effect=Exception("SQL execution error"))
        mock_pool.acquire = MagicMock()
        mock_pool.acquire.return_value.__aenter__ = AsyncMock(return_value=mock_conn)
        mock_pool.acquire.return_value.__aexit__ = AsyncMock(return_value=None)
        
        # Mock file reading
        init_sql_content = "CREATE TABLE facilities (id TEXT PRIMARY KEY);"
        
        with patch('builtins.open', mock_open(read_data=init_sql_content)):
            with patch('pathlib.Path.exists', return_value=True):
                # Should raise the exception
                with pytest.raises(Exception, match="SQL execution error"):
                    await init_database(mock_pool)
