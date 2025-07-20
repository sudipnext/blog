import React, { useState, useEffect, useRef } from 'react';

const BubbleSortVisualizer = () => {
  const [array, setArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [originalArray] = useState([64, 34, 25, 12, 22, 11, 90]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [comparingIndices, setComparingIndices] = useState([]);
  const [swappingIndices, setSwappingIndices] = useState([]);
  const [sortedIndices, setSortedIndices] = useState([]);
  const [speed, setSpeed] = useState(1000);
  const timeoutRef = useRef(null);

  const bubbleSortSteps = () => {
    const arr = [...array];
    const steps = [];
    const n = arr.length;

    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Add comparison step
        steps.push({
          array: [...arr],
          comparing: [j, j + 1],
          swapping: [],
          sorted: Array.from({ length: n - i - 1 }, (_, k) => n - 1 - k)
        });

        if (arr[j] > arr[j + 1]) {
          // Add swap step
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({
            array: [...arr],
            comparing: [],
            swapping: [j, j + 1],
            sorted: Array.from({ length: n - i - 1 }, (_, k) => n - 1 - k)
          });
        }
      }
    }

    // Final step - all sorted
    steps.push({
      array: [...arr],
      comparing: [],
      swapping: [],
      sorted: Array.from({ length: n }, (_, k) => k)
    });

    return steps;
  };

  const playAnimation = () => {
    const steps = bubbleSortSteps();
    setIsPlaying(true);
    setCurrentStep(0);

    const executeStep = (stepIndex) => {
      if (stepIndex >= steps.length) {
        setIsPlaying(false);
        setSortedIndices(Array.from({ length: array.length }, (_, k) => k));
        return;
      }

      const step = steps[stepIndex];
      setArray(step.array);
      setComparingIndices(step.comparing);
      setSwappingIndices(step.swapping);
      setSortedIndices(step.sorted);
      setCurrentStep(stepIndex);

      timeoutRef.current = setTimeout(() => {
        executeStep(stepIndex + 1);
      }, speed);
    };

    executeStep(0);
  };

  const stopAnimation = () => {
    setIsPlaying(false);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
  };

  const resetArray = () => {
    stopAnimation();
    setArray([...originalArray]);
    setCurrentStep(0);
    setComparingIndices([]);
    setSwappingIndices([]);
    setSortedIndices([]);
  };

  const getBarColor = (index) => {
    if (sortedIndices.includes(index)) return '#4CAF50'; // Green for sorted
    if (swappingIndices.includes(index)) return '#FF5722'; // Red for swapping
    if (comparingIndices.includes(index)) return '#FFC107'; // Yellow for comparing
    return '#2196F3'; // Blue for normal
  };

  const getMaxValue = () => Math.max(...array);

  // Time complexity data for visualization
  const timeComplexityData = [
    { n: 10, bestCase: 10, avgCase: 100, worstCase: 100 },
    { n: 20, bestCase: 20, avgCase: 400, worstCase: 400 },
    { n: 50, bestCase: 50, avgCase: 2500, worstCase: 2500 },
    { n: 100, bestCase: 100, avgCase: 10000, worstCase: 10000 },
    { n: 200, bestCase: 200, avgCase: 40000, worstCase: 40000 },
    { n: 500, bestCase: 500, avgCase: 250000, worstCase: 250000 },
  ];

  const maxComplexity = Math.max(...timeComplexityData.map(d => d.worstCase));

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '20px', 
      borderRadius: '10px', 
      maxWidth: '800px', 
      margin: '0 auto',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Interactive Bubble Sort Visualizer</h3>
      
      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <button 
          onClick={playAnimation} 
          disabled={isPlaying}
          style={{
            padding: '10px 20px',
            backgroundColor: isPlaying ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isPlaying ? 'not-allowed' : 'pointer'
          }}
        >
          {isPlaying ? 'Playing...' : 'Play'}
        </button>
        
        <button 
          onClick={stopAnimation}
          disabled={!isPlaying}
          style={{
            padding: '10px 20px',
            backgroundColor: !isPlaying ? '#ccc' : '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: !isPlaying ? 'not-allowed' : 'pointer'
          }}
        >
          Stop
        </button>
        
        <button 
          onClick={resetArray}
          disabled={isPlaying}
          style={{
            padding: '10px 20px',
            backgroundColor: isPlaying ? '#ccc' : '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isPlaying ? 'not-allowed' : 'pointer'
          }}
        >
          Reset
        </button>
      </div>

      {/* Speed Control */}
      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <label style={{ marginRight: '10px' }}>Speed: </label>
        <input
          type="range"
          min="200"
          max="2000"
          value={speed}
          onChange={(e) => setSpeed(parseInt(e.target.value))}
          style={{ marginRight: '10px' }}
          disabled={isPlaying}
        />
        <span>{speed}ms</span>
      </div>

      {/* Array Visualization */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'end', 
        gap: '5px',
        height: '250px',
        marginBottom: '20px',
        padding: '10px',
        backgroundColor: 'white',
        borderRadius: '5px'
      }}>
        {array.map((value, index) => (
          <div
            key={`${index}-${value}`}
            style={{
              width: '40px',
              height: `${(value / getMaxValue()) * 200}px`,
              backgroundColor: getBarColor(index),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontWeight: 'bold',
              borderRadius: '3px 3px 0 0',
              transition: 'all 0.3s ease',
              border: '1px solid #333',
              transform: swappingIndices.includes(index) ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            {value}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '20px',
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#2196F3', borderRadius: '3px' }}></div>
          <span>Normal</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#FFC107', borderRadius: '3px' }}></div>
          <span>Comparing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#FF5722', borderRadius: '3px' }}></div>
          <span>Swapping</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#4CAF50', borderRadius: '3px' }}></div>
          <span>Sorted</span>
        </div>
      </div>

      {/* Instructions */}
      <div style={{ 
        backgroundColor: '#e3f2fd', 
        padding: '15px', 
        borderRadius: '5px',
        fontSize: '14px',
        lineHeight: '1.5'
      }}>
        <h4 style={{ margin: '0 0 10px 0' }}>How to use:</h4>
        <ul style={{ margin: '0', paddingLeft: '20px' }}>
          <li>Click <strong>Play</strong> to watch the bubble sort algorithm in action</li>
          <li>Adjust the speed slider to control animation speed</li>
          <li>Click <strong>Reset</strong> to return to the original array</li>
          <li>Colors indicate: Normal (blue), Comparing (yellow), Swapping (red), Sorted (green)</li>
        </ul>
      </div>

      {/* Time Complexity Graph */}
      <div style={{ 
        marginTop: '30px', 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '5px',
        border: '1px solid #ddd'
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '20px' }}>Time Complexity Analysis</h4>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-around', 
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '20px'
        }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#4CAF50' }}>Best Case: O(n)</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Already sorted array</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#FF9800' }}>Average Case: O(n²)</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Random order</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontWeight: 'bold', color: '#f44336' }}>Worst Case: O(n²)</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Reverse sorted</div>
          </div>
        </div>

        {/* Simple Graph */}
        <div style={{ 
          display: 'flex', 
          alignItems: 'end', 
          justifyContent: 'center', 
          gap: '10px',
          height: '200px',
          backgroundColor: '#f9f9f9',
          padding: '20px',
          borderRadius: '5px'
        }}>
          {timeComplexityData.map((data, index) => (
            <div key={data.n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '10px', marginBottom: '5px' }}>n={data.n}</div>
              <div style={{ display: 'flex', alignItems: 'end', gap: '2px' }}>
                <div
                  style={{
                    width: '15px',
                    height: `${(data.bestCase / maxComplexity) * 150}px`,
                    backgroundColor: '#4CAF50',
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px'
                  }}
                  title={`Best: ${data.bestCase}`}
                />
                <div
                  style={{
                    width: '15px',
                    height: `${(data.avgCase / maxComplexity) * 150}px`,
                    backgroundColor: '#FF9800',
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px'
                  }}
                  title={`Average: ${data.avgCase}`}
                />
                <div
                  style={{
                    width: '15px',
                    height: `${(data.worstCase / maxComplexity) * 150}px`,
                    backgroundColor: '#f44336',
                    borderRadius: '2px 2px 0 0',
                    minHeight: '2px'
                  }}
                  title={`Worst: ${data.worstCase}`}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          gap: '20px',
          marginTop: '15px',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '15px', height: '15px', backgroundColor: '#4CAF50', borderRadius: '2px' }}></div>
            <span>Best O(n)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '15px', height: '15px', backgroundColor: '#FF9800', borderRadius: '2px' }}></div>
            <span>Average O(n²)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div style={{ width: '15px', height: '15px', backgroundColor: '#f44336', borderRadius: '2px' }}></div>
            <span>Worst O(n²)</span>
          </div>
        </div>
      </div>

      {/* Python Code Examples */}
      <div style={{ 
        marginTop: '30px'
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Python Implementation Examples</h4>
        
        {/* Basic Implementation */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>📝 Basic Implementation</h5>
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
{`def bubble_sort_basic(arr):
    """Basic bubble sort - O(n²) for all cases"""
    n = len(arr)
    
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    
    return arr

# Example usage
numbers = [64, 34, 25, 12, 22, 11, 90]
result = bubble_sort_basic(numbers.copy())
print(result)  # [11, 12, 22, 25, 34, 64, 90]`}
          </pre>
        </div>

        {/* Optimized Implementation */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>⚡ Optimized with Early Termination</h5>
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
{`def bubble_sort_optimized(arr):
    """Optimized bubble sort with early termination"""
    n = len(arr)
    
    for i in range(n):
        swapped = False
        
        for j in range(0, n - i - 1):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
                swapped = True
        
        # Early termination if no swaps occurred
        if not swapped:
            break
    
    return arr`}
          </pre>
        </div>
        {/* Python Code Explanation */}
        <div style={{
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ddd',
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>🔍 Explanation</h5>
          <p style={{ margin: '0', fontSize: '14px', lineHeight: '1.6' }}>
            The <code>bubble_sort_basic</code> function implements the basic bubble sort algorithm with a time complexity of O(n²) for all cases. The <code>bubble_sort_optimized</code> function adds an early termination condition to improve performance, especially for nearly sorted arrays.
          </p>
          <p style={{ margin: '10px 0 0 0', fontSize: '14px', lineHeight: '1.6' }}>
            Both functions take an array as input and return the sorted array. The optimized version checks if any swaps were made in each pass; if no swaps occur, it terminates early, indicating that the array is already sorted.
          </p>

        </div>
      </div>
    </div>);
};

export default BubbleSortVisualizer;