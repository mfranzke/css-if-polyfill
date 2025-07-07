# Media Query Tracking Enhancement

## Summary

This enhancement adds automatic media query change tracking to the CSS if() polyfill. Previously, `media()` conditions were only evaluated once during initial processing. Now, the polyfill automatically listens for media query changes and re-evaluates styles when viewport conditions change.

## Key Changes

### 1. Media Query Registry System

- Added `mediaQueryRegistry` Map to track which elements use which media queries
- Added `mediaQueryListeners` Map to manage MediaQueryList event listeners
- Prevents duplicate listeners for the same media query

### 2. Enhanced `evaluateMediaCondition` Function

- Now accepts tracking parameters to register media queries for change detection
- Optimized to reuse MediaQueryList objects to avoid duplicate `matchMedia` calls

### 3. Automatic Re-processing

- `reprocessElementsForMediaQuery()` function re-evaluates and updates affected elements
- Maintains original CSS content for accurate re-processing

### 4. Cleanup Management

- `cleanupMediaQueryListeners()` function for proper cleanup to prevent memory leaks
- Added to public API for manual cleanup when needed

## API Additions

### New Exports

```javascript
// Named export for cleanup
export { cleanupMediaQueryListeners };

// Added to CSSIfPolyfill object
CSSIfPolyfill.cleanup; // Alias for cleanupMediaQueryListeners
```

## Usage Example

```css
.responsive-element {
	/* This will automatically update when viewport changes */
	background-color: if(media(min-width: 768px): blue; else: red);
	font-size: if(media(min-width: 768px): 18px; else: 14px);
}
```

When the user resizes their browser window, the polyfill automatically:

1. Detects the media query change via MediaQueryList listeners
2. Re-evaluates the original CSS with current media query states
3. Updates the element's styles in real-time

## Benefits

1. **Automatic Updates**: Styles respond to viewport changes without manual intervention
2. **Performance**: Efficient listener management prevents duplicate registrations
3. **Memory Safety**: Proper cleanup prevents memory leaks
4. **Backwards Compatible**: Existing code continues to work unchanged

## Testing

Added comprehensive test suite (`test/media-query-tracking.test.js`) covering:

- Media query listener registration
- Listener reuse for duplicate queries
- Multiple media query handling
- Cleanup functionality
- Error handling for malformed queries

All existing tests continue to pass, ensuring backwards compatibility.
