"""Unit tests for Work ID handling — the correlation key for the whole ecosystem."""

from __future__ import annotations

import pytest

from goldenpath_cli import workid


@pytest.mark.parametrize("value", ["FIN-123", "OPS-7", "PLATFORM-99999"])
def test_valid_work_ids(value: str) -> None:
    assert workid.is_valid(value)


@pytest.mark.parametrize("value", ["fin-123", "FIN123", "FIN-", "F-1", "123", "FIN-12a"])
def test_invalid_work_ids(value: str) -> None:
    assert not workid.is_valid(value)


def test_extract_from_branch_and_title() -> None:
    assert workid.extract("feature/FIN-123-add-retries") == "FIN-123"
    assert workid.extract("FIN-123: add retries") == "FIN-123"
    assert workid.extract("no id here") is None


def test_require_raises_when_missing() -> None:
    with pytest.raises(workid.InvalidWorkIdError):
        workid.require("no work id", context="PR title")


def test_branch_name_is_conventional() -> None:
    assert workid.branch_name("FIN-123", "Add Retries!") == "feature/FIN-123-add-retries"
    assert workid.branch_name("FIN-123", "") == "feature/FIN-123"


def test_branch_name_rejects_bad_work_id() -> None:
    with pytest.raises(workid.InvalidWorkIdError):
        workid.branch_name("bad", "desc")
