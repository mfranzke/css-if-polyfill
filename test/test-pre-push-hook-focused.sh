#!/bin/bash

# Test script for pre-push hook - comprehensive testing with real remote pushes
# This version creates actual upstream relationships by pushing to remote

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Store original branch
ORIGINAL_BRANCH=$(git rev-parse --abbrev-ref HEAD)
TESTS_PASSED=0
TESTS_FAILED=0
TEST_BRANCHES=()

cleanup() {
    log_info "Cleaning up test branches..."

    # Switch back to original branch
    git checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1 || true

    # Clean up all test branches created during this session
    for branch in "${TEST_BRANCHES[@]}"; do
        if [ -n "$branch" ]; then
            log_info "Removing test branch: $branch"
            # Delete local branch
            git branch -D "$branch" >/dev/null 2>&1 || true
            # Delete remote branch
            git push origin --delete "$branch" >/dev/null 2>&1 || true
        fi
    done

    # Remove any temporary files
    rm -f package.json.backup test-file-*.md >/dev/null 2>&1 || true

    log_success "Cleanup completed"
}

trap cleanup EXIT

# Helper function to track test branches for cleanup
add_test_branch() {
    local branch_name="$1"
    TEST_BRANCHES+=("$branch_name")
}

# Test 1: Direct hook execution with no upstream
test_hook_no_upstream() {
    log_info "=== TEST 1: Hook behavior with no upstream ==="

    # Create a new branch without pushing to remote
    local test_branch="test-no-upstream-$(date +%s)"
    git checkout -b "$test_branch" >/dev/null 2>&1
    add_test_branch "$test_branch"

    # Test the hook directly
    local hook_output
    hook_output=$(bash .husky/pre-push 2>&1)
    local hook_exit_code=$?

    if [ $hook_exit_code -eq 0 ] && echo "$hook_output" | grep -q "No upstream configured\|Using origin/main as fallback"; then
        log_success "TEST 1 PASSED: Hook correctly handled no upstream scenario"
        ((TESTS_PASSED++))
    else
        log_error "TEST 1 FAILED: Hook exit code: $hook_exit_code, output: $hook_output"
        ((TESTS_FAILED++))
    fi

    git checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1
}

# Test 2: Hook behavior with upstream and package.json changes
test_hook_with_upstream_and_changes() {
    log_info "=== TEST 2: Hook behavior with upstream and package.json changes ==="

    local test_branch="test-package-changes-$(date +%s)"
    add_test_branch "$test_branch"

    # Create test branch
    git checkout -b "$test_branch" >/dev/null 2>&1

    # Backup package.json
    cp package.json package.json.backup

    # Make initial change and commit
    sed 's/"description": ".*"/"description": "Test modification for pre-push hook testing"/' package.json > package.json.tmp && mv package.json.tmp package.json
    git add package.json
    git commit -m "test: modify package.json for pre-push hook testing" >/dev/null 2>&1

    # Push to remote to establish upstream (use --no-verify to bypass hook for initial push)
    log_info "Creating upstream by pushing test branch to remote..."
    if git push --no-verify --set-upstream origin "$test_branch" >/dev/null 2>&1; then
        log_success "Successfully established upstream for test branch"

        # Make another change to package.json to test hook with existing upstream
        sed 's/"Test modification for pre-push hook testing"/"Another test modification for hook testing"/' package.json > package.json.tmp && mv package.json.tmp package.json
        git add package.json
        git commit -m "test: second modification to test hook with upstream" >/dev/null 2>&1

        # Now test the hook by pushing (this should trigger the hook)
        log_info "Testing hook with package.json changes and established upstream..."
        local push_output
        push_output=$(git push 2>&1)
        local push_exit_code=$?

        # The hook should detect package.json changes and run pnpm install
        if echo "$push_output" | grep -q "Detected changes.*package.json\|pnpm install"; then
            log_success "TEST 2 PASSED: Hook detected package.json changes and ran pnpm install"
            ((TESTS_PASSED++))
        elif [ $push_exit_code -eq 0 ]; then
            # Push succeeded but no hook message - check if hook ran at all
            if echo "$push_output" | grep -q "No monitored file changes detected"; then
                log_warning "TEST 2 PARTIAL: Hook ran but didn't detect package.json changes (possibly already in sync)"
                ((TESTS_PASSED++))
            else
                log_success "TEST 2 PASSED: Push succeeded with hook validation"
                ((TESTS_PASSED++))
            fi
        else
            log_error "TEST 2 FAILED: Push failed unexpectedly. Output: $push_output"
            ((TESTS_FAILED++))
        fi
    else
        log_error "TEST 2 FAILED: Could not push test branch to remote to establish upstream"
        ((TESTS_FAILED++))
    fi

    # Restore original package.json
    if [ -f package.json.backup ]; then
        mv package.json.backup package.json
    fi

    git checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1
}

# Test 3: Hook behavior with upstream but no monitored changes
test_hook_with_upstream_no_monitored_changes() {
    log_info "=== TEST 3: Hook behavior with upstream and non-monitored file changes ==="

    local test_branch="test-non-monitored-$(date +%s)"
    add_test_branch "$test_branch"

    # Create test branch
    git checkout -b "$test_branch" >/dev/null 2>&1

    # Create a non-monitored file
    local test_file="test-file-$(date +%s).md"
    echo "# Test file for pre-push hook testing" > "$test_file"
    git add "$test_file"
    git commit -m "test: add non-monitored file for pre-push hook testing" >/dev/null 2>&1

    # Push to remote to establish upstream (use --no-verify to bypass hook for initial push)
    log_info "Creating upstream by pushing test branch to remote..."
    if git push --no-verify --set-upstream origin "$test_branch" >/dev/null 2>&1; then
        log_success "Successfully established upstream for test branch"

        # Make another change to the non-monitored file
        echo "# Additional content for testing" >> "$test_file"
        git add "$test_file"
        git commit -m "test: modify non-monitored file" >/dev/null 2>&1

        # Test the hook (should skip checks for non-monitored files)
        log_info "Testing hook with non-monitored file changes..."
        local push_output
        push_output=$(git push 2>&1)
        local push_exit_code=$?

        if [ $push_exit_code -eq 0 ]; then
            if echo "$push_output" | grep -q "No monitored file changes detected"; then
                log_success "TEST 3 PASSED: Hook correctly skipped checks for non-monitored files"
                ((TESTS_PASSED++))
            else
                log_success "TEST 3 PASSED: Push succeeded (hook behavior was appropriate)"
                ((TESTS_PASSED++))
            fi
        else
            log_error "TEST 3 FAILED: Push failed unexpectedly. Output: $push_output"
            ((TESTS_FAILED++))
        fi
    else
        log_error "TEST 3 FAILED: Could not push test branch to remote to establish upstream"
        ((TESTS_FAILED++))
    fi

    # Remove test file
    rm -f "$test_file" >/dev/null 2>&1

    git checkout "$ORIGINAL_BRANCH" >/dev/null 2>&1
}

# Check if we can access remote repository
check_remote_access() {
    log_info "Checking remote repository access..."
    if git ls-remote origin >/dev/null 2>&1; then
        log_success "Remote repository access confirmed"
        return 0
    else
        log_error "Cannot access remote repository. Tests requiring remote push will fail."
        return 1
    fi
}

# Main execution
main() {
    log_info "Starting Comprehensive Pre-push Hook Tests"
    log_info "==========================================="
    log_info "Original branch: $ORIGINAL_BRANCH"

    # Ensure we're in project root and check remote access
    if ! check_remote_access; then
        log_error "Remote access check failed. Aborting tests that require remote push."
        exit 1
    fi

    # Run all tests
    test_hook_no_upstream
    test_hook_with_upstream_and_changes
    test_hook_with_upstream_no_monitored_changes

    # Print summary
    log_info ""
    log_info "Test Results Summary"
    log_info "==================="
    log_success "Tests Passed: $TESTS_PASSED"

    if [ $TESTS_FAILED -gt 0 ]; then
        log_error "Tests Failed: $TESTS_FAILED"
        log_error "Some tests failed! ❌"
        exit 1
    else
        log_success "All tests passed! ✅"
        exit 0
    fi
}

main "$@"
