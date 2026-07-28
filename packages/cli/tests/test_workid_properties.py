"""Property-Based Tests for Work ID handling (hypothesis).

Example-based tests pin known cases; these assert *invariants* that must hold
for every well-formed Work ID and arbitrary description — the kind of coverage
the PR pipeline's "Property-Based Testing" stage expects.
"""

from __future__ import annotations

from hypothesis import given, strategies as st

from goldenpath_cli import workid

# A strategy that generates well-formed Work IDs like "FIN-123", "OPSTEAM-7".
work_ids = st.builds(
    lambda prefix, num: f"{prefix}-{num}",
    st.text(alphabet="ABCDEFGHIJKLMNOPQRSTUVWXYZ", min_size=2, max_size=8),
    st.integers(min_value=0, max_value=10**9),
)


@given(work_ids)
def test_generated_work_ids_are_always_valid(wid: str) -> None:
    assert workid.is_valid(wid)


@given(work_ids)
def test_lowercasing_a_work_id_is_never_valid(wid: str) -> None:
    # Work IDs are uppercase by contract; the lowercase form must be rejected.
    assert not workid.is_valid(wid.lower())


@given(work_ids, st.text())
def test_branch_name_roundtrips_the_work_id(wid: str, description: str) -> None:
    # For any valid id + any description, the id survives into the branch name
    # and can be extracted back out unchanged.
    name = workid.branch_name(wid, description)
    assert name.startswith(f"feature/{wid}")
    assert workid.extract(name) == wid


@given(work_ids, st.text())
def test_require_recovers_the_work_id_from_a_pr_title(wid: str, suffix: str) -> None:
    title = f"{wid}: {suffix}"
    assert workid.require(title, context="PR title") == wid
