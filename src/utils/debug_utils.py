"""
调试工具 - 用于排查API问题
"""

import logging
from typing import Any, Dict

logger = logging.getLogger(__name__)


def debug_request_data(data: Dict[str, Any], endpoint: str = "unknown") -> None:
    """调试请求数据"""
    logger.info(f"=== DEBUG [{endpoint}] ===")
    logger.info(f"Request data: {data}")
    logger.info(f"Data type: {type(data)}")
    
    if data:
        logger.info("Available keys:")
        for key, value in data.items():
            logger.info(f"  {key}: '{value}' (type: {type(value).__name__})")
    else:
        logger.info("Data is empty or None")
    
    logger.info("=== END DEBUG ===")


def safe_get_field(data: Dict[str, Any], field_names: list) -> str:
    """安全获取字段值，支持多个字段名"""
    if not data:
        return ""
    
    for field_name in field_names:
        value = data.get(field_name, '')
        if value and isinstance(value, str):
            return value.strip()
    
    return ""