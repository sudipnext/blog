import React, { useState, useEffect, useRef } from 'react';

const SlidingWindowVisualizer = () => {
  const [problemType, setProblemType] = useState('substring-count');
  const [inputString, setInputString] = useState('abcabcabcabc');
  const [pattern, setPattern] = useState('abc');
  const [windowSize, setWindowSize] = useState(3);
  const [currentWindow, setCurrentWindow] = useState({ start: 0, end: 2 });
  const [isAnimating, setIsAnimating] = useState(false);
  const [matches, setMatches] = useState([]);
  const [step, setStep] = useState(0);
  const [totalSteps, setTotalSteps] = useState(0);
  const [result, setResult] = useState(null);
  const timeoutRef = useRef(null);

  // Get default values based on problem type
  const getDefaultValues = (problemType) => {
    switch (problemType) {
      case 'substring-count':
        return { inputString: 'abcabcabcabc', pattern: 'abc' };
      case 'max-sum':
        return { inputString: '2153142', pattern: '' };
      case 'longest-unique':
        return { inputString: 'abcabcbb', pattern: '' };
      case 'min-window':
        return { inputString: 'ADOBECODEBANC', pattern: 'ABC' };
      default:
        return { inputString: 'abcabcabcabc', pattern: 'abc' };
    }
  };

  // Update default values when problem type changes
  useEffect(() => {
    const defaults = getDefaultValues(problemType);
    setInputString(defaults.inputString);
    setPattern(defaults.pattern);
  }, [problemType]);

  // Problem configurations
  const problems = {
    'substring-count': {
      title: 'Count Substring Occurrences',
      description: 'Find how many times a pattern appears in the string',
      usePattern: true,
      fixedWindow: true
    },
    'max-sum': {
      title: 'Maximum Sum Subarray of Size K',
      description: 'Find the maximum sum of k consecutive elements',
      usePattern: false,
      fixedWindow: true
    },
    'longest-unique': {
      title: 'Longest Substring Without Repeating Characters',
      description: 'Find the longest substring with all unique characters',
      usePattern: false,
      fixedWindow: false
    },
    'min-window': {
      title: 'Minimum Window Substring',
      description: 'Find the smallest window containing all pattern characters',
      usePattern: true,
      fixedWindow: false
    }
  };

  // Initialize problem data
  useEffect(() => {
    resetVisualization();
  }, [problemType, inputString, pattern, windowSize]);

  const resetVisualization = () => {
    if (problemType === 'max-sum') {
      setCurrentWindow({ start: 0, end: windowSize - 1 });
    } else if (problemType === 'min-window') {
      setCurrentWindow({ start: 0, end: 0 });
    } else {
      setCurrentWindow({ start: 0, end: pattern.length - 1 });
    }
    setMatches([]);
    setStep(0);
    setResult(null);
    setIsAnimating(false);
    
    const problem = problems[problemType];
    if (problem.fixedWindow) {
      const size = problemType === 'max-sum' ? windowSize : pattern.length;
      setTotalSteps(Math.max(0, inputString.length - size + 1));
    } else {
      setTotalSteps(inputString.length);
    }
  };

  const getCharacterStyle = (index) => {
    const { start, end } = currentWindow;
    let backgroundColor = '#f0f0f0';
    let color = '#333';
    let borderColor = '#ddd';

    // Check if character is in current window
    if (index >= start && index <= end) {
      backgroundColor = '#2196F3';
      color = 'white';
      borderColor = '#1976D2';
    }

    // Check if this position is a match
    if (matches.some(match => index >= match.start && index <= match.end)) {
      backgroundColor = '#4CAF50';
      borderColor = '#388E3C';
    }

    // Highlight current comparing character
    if (isAnimating && index === start + (step % (end - start + 1))) {
      backgroundColor = '#FF5722';
      borderColor = '#D84315';
    }

    return {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '40px',
      height: '40px',
      margin: '2px',
      backgroundColor,
      color,
      border: `2px solid ${borderColor}`,
      borderRadius: '6px',
      fontSize: '14px',
      fontWeight: 'bold',
      transition: 'all 0.3s ease',
      transform: index >= start && index <= end ? 'scale(1.05)' : 'scale(1)'
    };
  };

  const solveSubstringCount = () => {
    const winSize = pattern.length;
    const lString = inputString.length;
    let cnt = 0;
    const foundMatches = [];
    const nWindowSlides = lString - winSize;

    for (let i = 0; i <= nWindowSlides; i++) {
      const currWin = inputString.slice(i, winSize + i);
      if (pattern === currWin) {
        cnt++;
        foundMatches.push({ start: i, end: i + winSize - 1 });
      }
    }

    return { count: cnt, matches: foundMatches };
  };

  const solveMaxSum = () => {
    if (windowSize > inputString.length) return { sum: 0, matches: [] };
    
    // Convert string to numbers for sum calculation
    const numbers = inputString.split('').map(char => char.charCodeAt(0) % 10);
    let maxSum = 0;
    let currentSum = 0;
    let bestWindow = { start: 0, end: windowSize - 1 };

    // Calculate initial window sum
    for (let i = 0; i < windowSize; i++) {
      currentSum += numbers[i];
    }
    maxSum = currentSum;

    // Slide the window
    for (let i = 1; i <= numbers.length - windowSize; i++) {
      currentSum = currentSum - numbers[i - 1] + numbers[i + windowSize - 1];
      if (currentSum > maxSum) {
        maxSum = currentSum;
        bestWindow = { start: i, end: i + windowSize - 1 };
      }
    }

    return { sum: maxSum, matches: [bestWindow] };
  };

  const solveLongestUnique = () => {
    let left = 0;
    let maxLength = 0;
    let bestWindow = { start: 0, end: 0 };
    const charSet = new Set();

    for (let right = 0; right < inputString.length; right++) {
      while (charSet.has(inputString[right])) {
        charSet.delete(inputString[left]);
        left++;
      }
      charSet.add(inputString[right]);
      
      if (right - left + 1 > maxLength) {
        maxLength = right - left + 1;
        bestWindow = { start: left, end: right };
      }
    }

    return { length: maxLength, matches: [bestWindow] };
  };

  const solveMinWindow = () => {
    if (!pattern || pattern.length === 0) return { window: '', matches: [] };
    
    // Count characters in pattern
    const patternCount = {};
    for (let char of pattern) {
      patternCount[char] = (patternCount[char] || 0) + 1;
    }
    
    let left = 0;
    let right = 0;
    let formed = 0; // Number of unique chars in current window with desired frequency
    let required = Object.keys(patternCount).length;
    
    let windowCounts = {};
    let minLen = Infinity;
    let minWindow = { start: 0, end: 0 };
    
    while (right < inputString.length) {
      // Add character from right to the window
      let char = inputString[right];
      windowCounts[char] = (windowCounts[char] || 0) + 1;
      
      // If frequency of current character added equals desired count, increment formed
      if (patternCount[char] && windowCounts[char] === patternCount[char]) {
        formed++;
      }
      
      // Try to contract the window until it's no longer 'desirable'
      while (left <= right && formed === required) {
        char = inputString[left];
        
        // Save the smallest window
        if (right - left + 1 < minLen) {
          minLen = right - left + 1;
          minWindow = { start: left, end: right };
        }
        
        // Remove from left of our window
        windowCounts[char]--;
        if (patternCount[char] && windowCounts[char] < patternCount[char]) {
          formed--;
        }
        
        left++;
      }
      
      right++;
    }
    
    return minLen === Infinity 
      ? { window: '', matches: [] }
      : { 
          window: inputString.substring(minWindow.start, minWindow.end + 1), 
          matches: [minWindow],
          length: minLen 
        };
  };

  const startAnimation = async () => {
    setIsAnimating(true);
    setMatches([]);
    setResult(null);

    const problem = problems[problemType];
    
    if (problem.fixedWindow) {
      const size = problemType === 'max-sum' ? windowSize : pattern.length;
      
      for (let i = 0; i <= inputString.length - size; i++) {
        setCurrentWindow({ start: i, end: i + size - 1 });
        setStep(i + 1);
        
        // Check for match in current window
        if (problemType === 'substring-count') {
          const currWin = inputString.slice(i, i + size);
          if (pattern === currWin) {
            setMatches(prev => [...prev, { start: i, end: i + size - 1 }]);
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    } else {
      // Variable window animation (simplified)
      for (let i = 0; i < inputString.length; i++) {
        setCurrentWindow({ start: 0, end: i });
        setStep(i + 1);
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Calculate final result
    let finalResult;
    switch (problemType) {
      case 'substring-count':
        finalResult = solveSubstringCount();
        setMatches(finalResult.matches);
        setResult(`Found ${finalResult.count} occurrences`);
        break;
      case 'max-sum':
        finalResult = solveMaxSum();
        setMatches(finalResult.matches);
        setResult(`Maximum sum: ${finalResult.sum}`);
        break;
      case 'longest-unique':
        finalResult = solveLongestUnique();
        setMatches(finalResult.matches);
        setResult(`Longest unique substring length: ${finalResult.length}`);
        break;
      case 'min-window':
        finalResult = solveMinWindow();
        setMatches(finalResult.matches);
        setResult(finalResult.window ? `Minimum window: "${finalResult.window}" (length: ${finalResult.length})` : 'No valid window found');
        break;
      default:
        setResult('Animation complete');
    }

    setIsAnimating(false);
  };

  const stopAnimation = () => {
    setIsAnimating(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const currentProblem = problems[problemType];

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '20px', 
      borderRadius: '10px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Interactive Sliding Window Visualizer</h3>
      
      {/* Problem Type Selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {Object.entries(problems).map(([key, problem]) => (
          <button
            key={key}
            onClick={() => setProblemType(key)}
            disabled={isAnimating}
            style={{
              padding: '8px 12px',
              backgroundColor: problemType === key ? '#2196F3' : '#fff',
              color: problemType === key ? 'white' : '#333',
              border: '1px solid #2196F3',
              borderRadius: '5px',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              fontSize: '11px',
              minWidth: '120px',
              textAlign: 'center'
            }}
          >
            {problem.title}
          </button>
        ))}
      </div>

      {/* Problem Description */}
      <div style={{
        textAlign: 'center',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: '#e3f2fd',
        borderRadius: '5px',
        color: '#1976d2'
      }}>
        <strong>{currentProblem.title}</strong>
        <br />
        <span style={{ fontSize: '14px' }}>{currentProblem.description}</span>
      </div>

      {/* Input Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '15px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <label style={{ fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Input String:</label>
          <input
            type="text"
            value={inputString}
            onChange={(e) => setInputString(e.target.value)}
            disabled={isAnimating}
            style={{
              padding: '8px 12px',
              border: '1px solid #ccc',
              borderRadius: '5px',
              width: '200px',
              fontSize: '14px'
            }}
          />
        </div>
        
        {currentProblem.usePattern && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Pattern:</label>
            <input
              type="text"
              value={pattern}
              onChange={(e) => setPattern(e.target.value)}
              disabled={isAnimating}
              style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                width: '100px',
                fontSize: '14px'
              }}
            />
          </div>
        )}

        {problemType === 'max-sum' && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', marginBottom: '5px', fontWeight: 'bold' }}>Window Size:</label>
            <input
              type="number"
              value={windowSize}
              onChange={(e) => setWindowSize(parseInt(e.target.value) || 1)}
              disabled={isAnimating}
              min="1"
              max={inputString.length}
              style={{
                padding: '8px 12px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                width: '80px',
                fontSize: '14px'
              }}
            />
          </div>
        )}
      </div>

      {/* Control Buttons */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px'
      }}>
        <button 
          onClick={startAnimation}
          disabled={isAnimating || !inputString || (currentProblem.usePattern && !pattern)}
          style={{
            padding: '10px 20px',
            backgroundColor: isAnimating ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          {isAnimating ? 'Running...' : 'Start Animation'}
        </button>
        
        <button 
          onClick={stopAnimation}
          disabled={!isAnimating}
          style={{
            padding: '10px 20px',
            backgroundColor: !isAnimating ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Stop
        </button>
        
        <button 
          onClick={resetVisualization}
          disabled={isAnimating}
          style={{
            padding: '10px 20px',
            backgroundColor: isAnimating ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '14px'
          }}
        >
          Reset
        </button>
      </div>

      {/* Progress Indicator */}
      {totalSteps > 0 && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          fontSize: '14px',
          color: '#666'
        }}>
          Step {step} of {totalSteps}
          {currentProblem.fixedWindow && (
            <span style={{ marginLeft: '10px' }}>
              Window: [{currentWindow.start}, {currentWindow.end}]
            </span>
          )}
        </div>
      )}

      {/* String Visualization */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '120px',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '5px',
        flexWrap: 'wrap',
        gap: '5px',
        position: 'relative'
      }}>
        {inputString.length === 0 ? (
          <div style={{ color: '#666', fontSize: '14px' }}>
            Enter a string to visualize
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            justifyContent: 'center', 
            gap: '2px',
            position: 'relative'
          }}>
            {/* Sliding Window Overlay Rectangle */}
            {inputString.length > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  top: '-8px',
                  left: `${currentWindow.start * 44 + currentWindow.start * 2}px`, // 44px width + 2px gap per character
                  width: `${(currentWindow.end - currentWindow.start + 1) * 44 + (currentWindow.end - currentWindow.start) * 2}px`,
                  height: '56px', // 40px character height + 16px padding
                  border: '3px solid #FF5722',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 87, 34, 0.1)',
                  boxShadow: '0 0 10px rgba(255, 87, 34, 0.3)',
                  transition: 'all 0.5s ease-in-out',
                  zIndex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <div style={{
                  position: 'absolute',
                  top: '-30px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  backgroundColor: '#FF5722',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}>
                  Window [{currentWindow.start}, {currentWindow.end}]
                </div>
              </div>
            )}
            
            {inputString.split('').map((char, index) => (
              <div key={index} style={{
                ...getCharacterStyle(index),
                position: 'relative',
                zIndex: 2
              }}>
                {char}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Result Display */}
      {result && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          padding: '15px',
          backgroundColor: '#e8f5e8',
          borderRadius: '5px',
          color: '#2e7d32',
          fontSize: '16px',
          fontWeight: 'bold'
        }}>
          {result}
        </div>
      )}

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        fontSize: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#f0f0f0', border: '1px solid #ddd', borderRadius: '3px' }}></div>
          <span>Normal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#2196F3', borderRadius: '3px' }}></div>
          <span>Current Window</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#4CAF50', borderRadius: '3px' }}></div>
          <span>Match Found</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#FF5722', borderRadius: '3px' }}></div>
          <span>Comparing</span>
        </div>
      </div>

      {/* Algorithm Explanation */}
      <div style={{ 
        backgroundColor: '#fff3cd', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px',
        border: '1px solid #ffeaa7'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#856404' }}>How it works:</h4>
        <div style={{ color: '#856404', fontSize: '14px', lineHeight: '1.5' }}>
          {problemType === 'substring-count' && (
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Create a window of size equal to pattern length</li>
              <li>Slide the window from left to right across the string</li>
              <li>At each position, compare window content with the pattern</li>
              <li>Count matches and continue until end of string</li>
              <li>Time Complexity: O(n) where n is string length</li>
            </ul>
          )}
          {problemType === 'max-sum' && (
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Create a fixed-size window of k elements</li>
              <li>Calculate sum of first window</li>
              <li>Slide window: remove left element, add right element</li>
              <li>Track maximum sum encountered</li>
              <li>Time Complexity: O(n) vs O(n*k) brute force</li>
            </ul>
          )}
          {problemType === 'longest-unique' && (
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Use variable-size window with two pointers</li>
              <li>Expand window when characters are unique</li>
              <li>Contract window when duplicate found</li>
              <li>Track maximum window size</li>
              <li>Time Complexity: O(n) vs O(n³) brute force</li>
            </ul>
          )}
          {problemType === 'min-window' && (
            <ul style={{ margin: '0', paddingLeft: '20px' }}>
              <li>Use variable-size window with two pointers</li>
              <li>Expand right pointer to include more characters</li>
              <li>Contract left pointer when window is valid</li>
              <li>Track minimum valid window that contains all pattern chars</li>
              <li>Time Complexity: O(|s| + |t|) where s is string, t is pattern</li>
            </ul>
          )}
        </div>
      </div>

      {/* Python Code Examples */}
      <div style={{ 
        marginTop: '20px'
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Python Implementation</h4>
        
        {/* Current Problem Implementation */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>
            {problemType === 'substring-count' && '🎯 Count Substring Occurrences'}
            {problemType === 'max-sum' && '📊 Maximum Sum Subarray'}
            {problemType === 'longest-unique' && '🔍 Longest Unique Substring'}
            {problemType === 'min-window' && '🪟 Minimum Window Substring'}
          </h5>
          <pre style={{ 
            backgroundColor: '#2d3748', 
            color: '#e2e8f0', 
            padding: '12px', 
            borderRadius: '5px',
            fontSize: '12px',
            overflow: 'auto',
            margin: '0',
            lineHeight: '1.4'
          }}>
            {problemType === 'substring-count' && 
`def count_substring(string, sub_string):
    """
    Count occurrences of substring using sliding window
    Time: O(n), Space: O(1)
    """
    win_size = len(sub_string)
    l_string = len(string)
    cnt = 0
    n_window_slides = l_string - win_size
    
    for i in range(n_window_slides + 1):
        curr_win = string[i:win_size + i]
        if sub_string == curr_win:
            cnt += 1
    
    return cnt

# Example usage
string = "abcabcabcabc"
pattern = "abc"
result = count_substring(string, pattern)
print(f"Pattern '{pattern}' found {result} times")  # Output: 4`}

            {problemType === 'max-sum' && 
`def max_sum_subarray(arr, k):
    """
    Find maximum sum of k consecutive elements
    Time: O(n), Space: O(1)
    """
    if k > len(arr):
        return 0
    
    # Calculate sum of first window
    window_sum = sum(arr[:k])
    max_sum = window_sum
    
    # Slide the window
    for i in range(1, len(arr) - k + 1):
        # Remove first element, add next element
        window_sum = window_sum - arr[i - 1] + arr[i + k - 1]
        max_sum = max(max_sum, window_sum)
    
    return max_sum

# Example usage
numbers = [2, 1, 5, 1, 3, 2]
k = 3
result = max_sum_subarray(numbers, k)
print(f"Maximum sum of {k} elements: {result}")  # Output: 9`}

            {problemType === 'longest-unique' && 
`def longest_unique_substring(s):
    """
    Find longest substring without repeating characters
    Time: O(n), Space: O(min(m,n)) where m is charset size
    """
    char_set = set()
    left = 0
    max_length = 0
    
    for right in range(len(s)):
        # If character is duplicate, shrink window
        while s[right] in char_set:
            char_set.remove(s[left])
            left += 1
        
        # Add current character and update max length
        char_set.add(s[right])
        max_length = max(max_length, right - left + 1)
    
    return max_length

# Example usage
string = "abcabcbb"
result = longest_unique_substring(string)
print(f"Longest unique substring length: {result}")  # Output: 3`}

            {problemType === 'min-window' && 
`def min_window_substring(s, t):
    """
    Find minimum window in s that contains all characters of t
    Time: O(|s| + |t|), Space: O(|s| + |t|)
    """
    if not s or not t:
        return ""
    
    # Count characters in t
    dict_t = {}
    for char in t:
        dict_t[char] = dict_t.get(char, 0) + 1
    
    required = len(dict_t)  # Number of unique chars in t
    formed = 0  # Number of unique chars with desired frequency
    
    window_counts = {}
    l, r = 0, 0  # Left and right pointers
    
    # ans = (window length, left, right)
    ans = float("inf"), None, None
    
    while r < len(s):
        # Add character from right to window
        character = s[r]
        window_counts[character] = window_counts.get(character, 0) + 1
        
        # Check if frequency matches desired count
        if character in dict_t and window_counts[character] == dict_t[character]:
            formed += 1
        
        # Contract window until no longer 'desirable'
        while l <= r and formed == required:
            character = s[l]
            
            # Save the smallest window
            if r - l + 1 < ans[0]:
                ans = (r - l + 1, l, r)
            
            # Remove from left of window
            window_counts[character] -= 1
            if character in dict_t and window_counts[character] < dict_t[character]:
                formed -= 1
            
            l += 1    
        
        r += 1    
    
    return "" if ans[0] == float("inf") else s[ans[1]:ans[2] + 1]

# Example usage
string = "ADOBECODEBANC"
pattern = "ABC"
result = min_window_substring(string, pattern)
print(f"Minimum window: '{result}'")  # Output: 'BANC'`}
          </pre>
        </div>

        
      </div>

      {/* Performance Tips */}
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#e8f5e8', 
        borderRadius: '5px',
        border: '1px solid #c8e6c9'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#2e7d32' }}>🚀 Sliding Window Tips & Tricks</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '15px',
          color: '#2e7d32'
        }}>
          <div>
            <h5 style={{ margin: '0 0 8px 0' }}>🎯 When to Use</h5>
            <ul style={{ margin: '0', paddingLeft: '15px', fontSize: '13px' }}>
              <li>Contiguous subarray/substring problems</li>
              <li>Finding optimal values (min/max)</li>
              <li>Pattern matching and counting</li>
              <li>Character frequency problems</li>
            </ul>
          </div>
          <div>
            <h5 style={{ margin: '0 0 8px 0' }}>⚡ Performance Benefits</h5>
            <ul style={{ margin: '0', paddingLeft: '15px', fontSize: '13px' }}>
              <li>Reduces O(n²) to O(n) complexity</li>
              <li>Eliminates redundant calculations</li>
              <li>Uses constant extra space</li>
              <li>Single-pass solution</li>
            </ul>
          </div>
          <div>
            <h5 style={{ margin: '0 0 8px 0' }}>🔧 Implementation Tips</h5>
            <ul style={{ margin: '0', paddingLeft: '15px', fontSize: '13px' }}>
              <li>Use hashmap for frequency tracking</li>
              <li>Handle edge cases (empty input)</li>
              <li>Choose fixed vs variable window</li>
              <li>Optimize window updates</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlidingWindowVisualizer;
