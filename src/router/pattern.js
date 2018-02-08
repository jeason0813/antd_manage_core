const patternFactory = () => {
  const CompiledPatternsCache = Object.create(null);

  const escapeRegExp = (string) => (string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));

  const formatPattern = (pattern) => {
    if (pattern.charAt(0) !== '/') {
      return `/${pattern}`;
    }
    return pattern;
  };

  const _compilePattern = (_pattern) => {  //eslint-disable-line
    const pattern = _pattern;
    let regexpSource = '';
    const paramNames = [];
    const tokens = [];

    let match = void 0;
    let lastIndex = 0;
    const matcher = /:([a-zA-Z_$][a-zA-Z0-9_$]*)|\*\*|\*|\(|\)/g;
    while (match = matcher.exec(pattern)) {  //eslint-disable-line
      if (match.index !== lastIndex) {
        tokens.push(pattern.slice(lastIndex, match.index));
        regexpSource += escapeRegExp(pattern.slice(lastIndex, match.index));
      }

      if (match[1]) {
        regexpSource += '([^/]+)';
        paramNames.push(match[1]);
      } else if (match[0] === '**') {
        regexpSource += '(.*)';
        paramNames.push('splat');
      } else if (match[0] === '*') {
        regexpSource += '(.*?)';
        paramNames.push('splat');
      } else if (match[0] === '(') {
        regexpSource += '(?:';
      } else if (match[0] === ')') {
        regexpSource += ')?';
      }

      tokens.push(match[0]);

      lastIndex = matcher.lastIndex;
    }

    if (lastIndex !== pattern.length) {
      tokens.push(pattern.slice(lastIndex, pattern.length));
      regexpSource += escapeRegExp(pattern.slice(lastIndex, pattern.length));
    }

    return {
      pattern,
      regexpSource,
      paramNames,
      tokens
    };
  };

  const compilePattern = (pattern) => {
    if (!CompiledPatternsCache[pattern]) CompiledPatternsCache[pattern] = _compilePattern(pattern);

    return CompiledPatternsCache[pattern];
  };

  const matchPattern = (_pattern, pathname) => {
    const pattern = formatPattern(_pattern);
    // Ensure pattern starts with leading slash for consistency with pathname.

    const _compilePattern2 = compilePattern(pattern);  //eslint-disable-line

    let regexpSource = _compilePattern2.regexpSource;
    const paramNames = _compilePattern2.paramNames;
    const tokens = _compilePattern2.tokens;


    if (pattern.charAt(pattern.length - 1) !== '/') {
      regexpSource += '/?'; // Allow optional path separator at end.
    }

    // Special-case patterns like '*' for catch-all routes.
    if (tokens[tokens.length - 1] === '*') {
      regexpSource += '$';
    }

    const match = pathname.match(new RegExp(`^${regexpSource}`, 'i'));
    if (match == null) {
      return null;
    }

    const matchedPath = match[0];
    let remainingPathname = pathname.substr(matchedPath.length);

    if (remainingPathname) {
      // Require that the match ends at a path separator, if we didn't match
      // the full path, so any remaining pathname is a new path segment.
      if (matchedPath.charAt(matchedPath.length - 1) !== '/') {
        return null;
      }

      // If there is a remaining pathname, treat the path separator as part of
      // the remaining pathname for properly continuing the match.
      remainingPathname = `/${remainingPathname}`;
    }

    return {
      remainingPathname,
      paramNames,
      paramValues: match.slice(1).map((v) => (v && decodeURIComponent(v)))
    };
  };

  return {
    escapeRegExp,
    formatPattern,
    compilePattern,
    matchPattern
  };
};

const Pattern = patternFactory();

export default Pattern;
