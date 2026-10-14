/* global window */
(function () {
  function logoAttrs(options) {
    options = options || {};
    if (options.decorative) {
      return 'aria-hidden="true" focusable="false"';
    }
    return 'role="img" aria-label="SKNotes"';
  }

  function symbol(size) {
    size = size || 32;
    var attrs = logoAttrs({ decorative: false });
    return (
      '<svg class="brand__symbol" ' +
      attrs +
      ' xmlns="http://www.w3.org/2000/svg" width="' +
      size +
      '" height="' +
      size +
      '" viewBox="0 0 32 32" fill="none">' +
      '<rect x="4" y="3" width="22" height="26" rx="4" class="brand__page" stroke="currentColor" stroke-width="1.75" fill="var(--color-surface)"/>' +
      '<path d="M22 3v5a2 2 0 0 0 2 2h4" class="brand__fold" stroke="var(--color-accent-brand)" stroke-width="1.5" stroke-linecap="round" fill="none"/>' +
      '<path d="M9 12h6M9 16h8M9 20h5" class="brand__lines" stroke="var(--color-accent-brand)" stroke-width="1.25" stroke-linecap="round" opacity="0.55"/>' +
      '<text x="9" y="11.5" class="brand__mono" font-family="system-ui, sans-serif" font-size="7.5" font-weight="700" fill="currentColor" letter-spacing="-0.04em">SK</text>' +
      "</svg>"
    );
  }

  function symbolDecorative(size) {
    return symbol(size).replace(
      'role="img" aria-label="SKNotes"',
      'aria-hidden="true" focusable="false"'
    );
  }

  function wordmark() {
    return (
      '<span class="brand__wordmark" aria-hidden="true">' +
      '<span class="brand__word-sk">SK</span><span class="brand__word-notes">Notes</span>' +
      "</span>"
    );
  }

  function logoFull(symbolSize) {
    symbolSize = symbolSize || 36;
    return (
      '<div class="brand-lockup">' +
      symbolDecorative(symbolSize) +
      wordmark() +
      "</div>"
    );
  }

  window.Brand = {
    symbol: symbol,
    symbolDecorative: symbolDecorative,
    wordmark: wordmark,
    logoFull: logoFull,
    logoAttrs: logoAttrs,
  };
})();
