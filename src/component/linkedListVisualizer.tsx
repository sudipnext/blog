import React, { useState, useEffect } from 'react';

const LinkedListVisualizer = () => {
  const [listType, setListType] = useState('singly');
  const [nodes, setNodes] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isAnimating, setIsAnimating] = useState(false);
  const [highlightedNode, setHighlightedNode] = useState(null);
  const [operation, setOperation] = useState('');

  // Initialize with sample data
  useEffect(() => {
    setNodes([
      { id: 1, value: 10, next: 2, prev: null },
      { id: 2, value: 20, next: 3, prev: 1 },
      { id: 3, value: 30, next: null, prev: 2 }
    ]);
  }, []);

  const addNode = async (position) => {
    if (!inputValue.trim()) return;
    
    setIsAnimating(true);
    setOperation(`Adding ${inputValue} at ${position}`);
    
    const newNode = {
      id: Date.now(),
      value: parseInt(inputValue),
      next: null,
      prev: null
    };

    let updatedNodes = [...nodes];

    if (position === 'head') {
      if (updatedNodes.length > 0) {
        newNode.next = updatedNodes[0].id;
        if (listType === 'doubly' || listType === 'doublyCircular') {
          updatedNodes[0].prev = newNode.id;
        }
      }
      updatedNodes.unshift(newNode);
    } else if (position === 'tail') {
      if (updatedNodes.length > 0) {
        const lastNode = updatedNodes[updatedNodes.length - 1];
        lastNode.next = newNode.id;
        if (listType === 'doubly' || listType === 'doublyCircular') {
          newNode.prev = lastNode.id;
        }
      }
      updatedNodes.push(newNode);
    }

    // Update all next/prev connections properly
    for (let i = 0; i < updatedNodes.length; i++) {
      const node = updatedNodes[i];
      
      // Set next connection
      if (i < updatedNodes.length - 1) {
        node.next = updatedNodes[i + 1].id;
      } else {
        node.next = null;
      }
      
      // Set prev connection for doubly linked lists
      if (listType === 'doubly' || listType === 'doublyCircular') {
        if (i > 0) {
          node.prev = updatedNodes[i - 1].id;
        } else {
          node.prev = null;
        }
      }
    }

    // Handle circular connections
    if (listType === 'circular' || listType === 'doublyCircular') {
      if (updatedNodes.length > 0) {
        const lastNode = updatedNodes[updatedNodes.length - 1];
        const firstNode = updatedNodes[0];
        lastNode.next = firstNode.id;
        if (listType === 'doublyCircular') {
          firstNode.prev = lastNode.id;
        }
      }
    }

    setNodes(updatedNodes);
    setInputValue('');
    
    // Highlight the new node
    setHighlightedNode(newNode.id);
    
    setTimeout(() => {
      setIsAnimating(false);
      setOperation('');
      setHighlightedNode(null);
    }, 1500);
  };

  const deleteNode = async (nodeId) => {
    setIsAnimating(true);
    setOperation(`Deleting node`);
    setHighlightedNode(nodeId);

    setTimeout(() => {
      let updatedNodes = nodes.filter(node => node.id !== nodeId);
      
      // Update connections
      updatedNodes.forEach(node => {
        if (node.next === nodeId) {
          const nextNode = nodes.find(n => n.id === nodeId);
          node.next = nextNode ? nextNode.next : null;
        }
        if (node.prev === nodeId) {
          const prevNode = nodes.find(n => n.id === nodeId);
          node.prev = prevNode ? prevNode.prev : null;
        }
      });

      // Handle circular connections
      if ((listType === 'circular' || listType === 'doublyCircular') && updatedNodes.length > 1) {
        const lastNode = updatedNodes[updatedNodes.length - 1];
        const firstNode = updatedNodes[0];
        lastNode.next = firstNode.id;
        if (listType === 'doublyCircular') {
          firstNode.prev = lastNode.id;
        }
      }

      setNodes(updatedNodes);
      setIsAnimating(false);
      setOperation('');
      setHighlightedNode(null);
    }, 1000);
  };

  const traverseList = async () => {
    if (nodes.length === 0) return;
    
    setIsAnimating(true);
    setOperation('Traversing list');
    
    for (let i = 0; i < nodes.length; i++) {
      setHighlightedNode(nodes[i].id);
      await new Promise(resolve => setTimeout(resolve, 800));
    }
    
    setIsAnimating(false);
    setOperation('');
    setHighlightedNode(null);
  };

  const clearList = () => {
    setNodes([]);
    setHighlightedNode(null);
    setOperation('');
  };

  const getNodeStyle = (nodeId) => {
    const isHighlighted = highlightedNode === nodeId;
    return {
      width: '60px',
      height: '60px',
      backgroundColor: isHighlighted ? '#FF5722' : '#2196F3',
      color: 'white',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 'bold',
      fontSize: '14px',
      border: '2px solid #333',
      transition: 'all 0.3s ease',
      transform: isHighlighted ? 'scale(1.1)' : 'scale(1)',
      position: 'relative' as const,
      margin: '0 10px',
      cursor: 'pointer'
    };
  };

  const getArrowStyle = (type = 'next') => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 5px',
    position: 'relative' as const,
    width: '40px',
    height: '20px'
  });

  const renderArrow = (direction = 'right', color = '#333') => {
    if (direction === 'right') {
      return (
        <div style={{ 
          width: '30px', 
          height: '2px', 
          backgroundColor: color,
          position: 'relative' as const,
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute' as const,
            right: '-5px',
            top: '-3px',
            width: '0',
            height: '0',
            borderLeft: '8px solid ' + color,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent'
          }} />
        </div>
      );
    } else {
      return (
        <div style={{ 
          width: '30px', 
          height: '2px', 
          backgroundColor: color,
          position: 'relative' as const,
          display: 'flex',
          alignItems: 'center'
        }}>
          <div style={{
            position: 'absolute' as const,
            left: '-5px',
            top: '-3px',
            width: '0',
            height: '0',
            borderRight: '8px solid ' + color,
            borderTop: '4px solid transparent',
            borderBottom: '4px solid transparent'
          }} />
        </div>
      );
    }
  };

  const renderNode = (node, index) => {
    const isLast = index === nodes.length - 1;
    const isCircular = listType === 'circular' || listType === 'doublyCircular';
    const isDoubly = listType === 'doubly' || listType === 'doublyCircular';
    const hasNext = !isLast || isCircular;
    
    return (
      <div key={node.id} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        position: 'relative' as const,
        margin: '0 10px'
      }}>
        {/* Previous arrow for doubly linked lists */}
        {isDoubly && index > 0 && (
          <div style={{ 
            position: 'absolute' as const,
            top: '-30px',
            left: '-25px',
            right: '-25px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {renderArrow('left', '#666')}
          </div>
        )}
        
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {/* Node */}
          <div 
            style={getNodeStyle(node.id)}
            onClick={() => !isAnimating && deleteNode(node.id)}
            title={`Click to delete node ${node.value}`}
          >
            {node.value}
          </div>

          {/* Next arrow */}
          {hasNext && (
            <div style={{ margin: '0 5px' }}>
              {renderArrow('right', '#333')}
            </div>
          )}
        </div>

        {/* Circular connection visualization */}
        {isCircular && isLast && nodes.length > 1 && (
          <div style={{
            position: 'absolute' as const,
            top: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            color: '#666',
            fontSize: '12px'
          }}>
            <div style={{ marginBottom: '5px' }}>↓</div>
            <div style={{ 
              padding: '5px 10px',
              backgroundColor: '#f0f0f0',
              borderRadius: '15px',
              border: '1px solid #ddd'
            }}>
              Connects to head
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ 
      border: '1px solid #ccc', 
      padding: '20px', 
      borderRadius: '10px', 
      maxWidth: '1000px', 
      margin: '0 auto',
      backgroundColor: '#f9f9f9'
    }}>
      <h3 style={{ textAlign: 'center', marginBottom: '20px' }}>Interactive Linked List Visualizer</h3>
      
      {/* List Type Selector */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap'
      }}>
        {[
          { value: 'singly', label: 'Singly Linked' },
          { value: 'doubly', label: 'Doubly Linked' },
          { value: 'circular', label: 'Circular' },
          { value: 'doublyCircular', label: 'Doubly Circular' }
        ].map(type => (
          <button
            key={type.value}
            onClick={() => setListType(type.value)}
            disabled={isAnimating}
            style={{
              padding: '8px 16px',
              backgroundColor: listType === type.value ? '#2196F3' : '#fff',
              color: listType === type.value ? 'white' : '#333',
              border: '1px solid #2196F3',
              borderRadius: '5px',
              cursor: isAnimating ? 'not-allowed' : 'pointer',
              fontSize: '12px'
            }}
          >
            {type.label}
          </button>
        ))}
      </div>

      {/* Controls */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '10px', 
        marginBottom: '20px',
        flexWrap: 'wrap',
        alignItems: 'center'
      }}>
        <input
          type="number"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter value"
          disabled={isAnimating}
          style={{
            padding: '8px 12px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            width: '100px'
          }}
        />
        
        <button 
          onClick={() => addNode('head')} 
          disabled={isAnimating || !inputValue.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating || !inputValue.trim() ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Add to Head
        </button>
        
        <button 
          onClick={() => addNode('tail')} 
          disabled={isAnimating || !inputValue.trim()}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating || !inputValue.trim() ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Add to Tail
        </button>
        
        <button 
          onClick={traverseList}
          disabled={isAnimating || nodes.length === 0}
          style={{
            padding: '8px 16px',
            backgroundColor: '#FF9800',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating || nodes.length === 0 ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Traverse
        </button>
        
        <button 
          onClick={clearList}
          disabled={isAnimating}
          style={{
            padding: '8px 16px',
            backgroundColor: '#f44336',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: isAnimating ? 'not-allowed' : 'pointer',
            fontSize: '12px'
          }}
        >
          Clear
        </button>
      </div>

      {/* Operation Status */}
      {operation && (
        <div style={{
          textAlign: 'center',
          marginBottom: '20px',
          padding: '10px',
          backgroundColor: '#e3f2fd',
          borderRadius: '5px',
          color: '#1976d2',
          fontWeight: 'bold'
        }}>
          {operation}
        </div>
      )}

      {/* List Visualization */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '150px',
        marginBottom: '20px',
        padding: '20px',
        backgroundColor: 'white',
        borderRadius: '5px',
        position: 'relative' as const,
        overflow: 'auto'
      }}>
        {nodes.length === 0 ? (
          <div style={{ color: '#666', fontSize: '14px', textAlign: 'center' }}>
            Empty list - add some nodes to get started!
          </div>
        ) : (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            flexWrap: 'nowrap',
            gap: '0px',
            minWidth: 'fit-content'
          }}>
            {nodes.map((node, index) => renderNode(node, index))}
          </div>
        )}
      </div>

      {/* List Type Info */}
      <div style={{ 
        backgroundColor: '#e8f5e8', 
        padding: '15px', 
        borderRadius: '5px',
        marginBottom: '20px'
      }}>
        <h4 style={{ margin: '0 0 10px 0', color: '#2e7d32' }}>
          Current Type: {listType.charAt(0).toUpperCase() + listType.slice(1).replace(/([A-Z])/g, ' $1')} Linked List
        </h4>
        <p style={{ margin: '0', fontSize: '14px', color: '#2e7d32' }}>
          {listType === 'singly' && 'Each node points to the next node. One-way traversal only.'}
          {listType === 'doubly' && 'Each node has pointers to both next and previous nodes. Bidirectional traversal.'}
          {listType === 'circular' && 'The last node points back to the first node, creating a circle.'}
          {listType === 'doublyCircular' && 'Combines doubly linked and circular features. Bidirectional circular traversal.'}
        </p>
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
          <li>Select a linked list type from the buttons above</li>
          <li>Enter a value and click "Add to Head" or "Add to Tail"</li>
          <li>Click on any node to delete it</li>
          <li>Use "Traverse" to see how the list is traversed</li>
          <li>Different colors and arrows show the structure of each list type</li>
        </ul>
      </div>

      {/* Python Code Examples */}
      <div style={{ 
        marginTop: '30px'
      }}>
        <h4 style={{ textAlign: 'center', marginBottom: '20px', color: '#333' }}>Python Implementation Examples</h4>
        
        {/* Singly Linked List */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>🔗 Singly Linked List</h5>
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
{`class Node:
    def __init__(self, data):
        self.data = data
        self.next = None

class SinglyLinkedList:
    def __init__(self):
        self.head = None
    
    def insert_at_head(self, data):
        new_node = Node(data)
        new_node.next = self.head
        self.head = new_node
    
    def insert_at_tail(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            return
        
        current = self.head
        while current.next:
            current = current.next
        current.next = new_node
    
    def delete(self, data):
        if not self.head:
            return
        
        if self.head.data == data:
            self.head = self.head.next
            return
        
        current = self.head
        while current.next and current.next.data != data:
            current = current.next
        
        if current.next:
            current.next = current.next.next
    
    def traverse(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        return elements

# Example usage
sll = SinglyLinkedList()
sll.insert_at_head(10)
sll.insert_at_tail(20)
sll.insert_at_tail(30)
print(sll.traverse())  # [10, 20, 30]`}
          </pre>
        </div>

        {/* Doubly Linked List */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>⚡ Doubly Linked List</h5>
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
{`class DoublyNode:
    def __init__(self, data):
        self.data = data
        self.next = None
        self.prev = None

class DoublyLinkedList:
    def __init__(self):
        self.head = None
        self.tail = None
    
    def insert_at_head(self, data):
        new_node = DoublyNode(data)
        if not self.head:
            self.head = self.tail = new_node
        else:
            new_node.next = self.head
            self.head.prev = new_node
            self.head = new_node
    
    def insert_at_tail(self, data):
        new_node = DoublyNode(data)
        if not self.tail:
            self.head = self.tail = new_node
        else:
            self.tail.next = new_node
            new_node.prev = self.tail
            self.tail = new_node
    
    def delete(self, data):
        current = self.head
        while current:
            if current.data == data:
                if current.prev:
                    current.prev.next = current.next
                else:
                    self.head = current.next
                
                if current.next:
                    current.next.prev = current.prev
                else:
                    self.tail = current.prev
                return
            current = current.next
    
    def traverse_forward(self):
        elements = []
        current = self.head
        while current:
            elements.append(current.data)
            current = current.next
        return elements
    
    def traverse_backward(self):
        elements = []
        current = self.tail
        while current:
            elements.append(current.data)
            current = current.prev
        return elements

# Example usage
dll = DoublyLinkedList()
dll.insert_at_head(10)
dll.insert_at_tail(20)
dll.insert_at_tail(30)
print(dll.traverse_forward())   # [10, 20, 30]
print(dll.traverse_backward())  # [30, 20, 10]`}
          </pre>
        </div>

        {/* Circular Linked List */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>🔄 Circular Linked List</h5>
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
{`class CircularLinkedList:
    def __init__(self):
        self.head = None
    
    def insert_at_head(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            new_node.next = new_node  # Points to itself
        else:
            # Find the last node
            current = self.head
            while current.next != self.head:
                current = current.next
            
            new_node.next = self.head
            current.next = new_node
            self.head = new_node
    
    def insert_at_tail(self, data):
        new_node = Node(data)
        if not self.head:
            self.head = new_node
            new_node.next = new_node
        else:
            current = self.head
            while current.next != self.head:
                current = current.next
            
            current.next = new_node
            new_node.next = self.head
    
    def delete(self, data):
        if not self.head:
            return
        
        # If only one node
        if self.head.next == self.head and self.head.data == data:
            self.head = None
            return
        
        current = self.head
        prev = None
        
        # Find the node to delete
        while True:
            if current.data == data:
                if prev:
                    prev.next = current.next
                else:  # Deleting head
                    # Find last node
                    while current.next != self.head:
                        current = current.next
                    current.next = self.head.next
                    self.head = self.head.next
                return
            
            prev = current
            current = current.next
            if current == self.head:
                break
    
    def traverse(self, max_nodes=10):
        if not self.head:
            return []
        
        elements = []
        current = self.head
        count = 0
        
        while count < max_nodes:
            elements.append(current.data)
            current = current.next
            count += 1
            if current == self.head and count > 1:
                break
        
        return elements

# Example usage
cll = CircularLinkedList()
cll.insert_at_head(10)
cll.insert_at_tail(20)
cll.insert_at_tail(30)
print(cll.traverse())  # [10, 20, 30]`}
          </pre>
        </div>

        {/* Doubly Circular Linked List */}
        <div style={{ 
          backgroundColor: '#f8f9fa', 
          padding: '15px', 
          borderRadius: '5px',
          border: '1px solid #ddd',
          marginBottom: '20px'
        }}>
          <h5 style={{ margin: '0 0 10px 0', color: '#333' }}>🔄⚡ Doubly Circular Linked List</h5>
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
{`class DoublyCircularLinkedList:
    def __init__(self):
        self.head = None
    
    def insert_at_head(self, data):
        new_node = DoublyNode(data)
        if not self.head:
            self.head = new_node
            new_node.next = new_node.prev = new_node
        else:
            last = self.head.prev
            new_node.next = self.head
            new_node.prev = last
            self.head.prev = new_node
            last.next = new_node
            self.head = new_node
    
    def insert_at_tail(self, data):
        new_node = DoublyNode(data)
        if not self.head:
            self.head = new_node
            new_node.next = new_node.prev = new_node
        else:
            last = self.head.prev
            new_node.next = self.head
            new_node.prev = last
            last.next = new_node
            self.head.prev = new_node
    
    def delete(self, data):
        if not self.head:
            return
        
        current = self.head
        while True:
            if current.data == data:
                if current.next == current:  # Only one node
                    self.head = None
                else:
                    current.prev.next = current.next
                    current.next.prev = current.prev
                    if current == self.head:
                        self.head = current.next
                return
            
            current = current.next
            if current == self.head:
                break
    
    def traverse(self, max_nodes=10):
        if not self.head:
            return []
        
        elements = []
        current = self.head
        count = 0
        
        while count < max_nodes:
            elements.append(current.data)
            current = current.next
            count += 1
            if current == self.head and count > 1:
                break
        
        return elements

# Example usage
dcll = DoublyCircularLinkedList()
dcll.insert_at_head(10)
dcll.insert_at_tail(20)
dcll.insert_at_tail(30)
print(dcll.traverse())  # [10, 20, 30]`}
          </pre>
        </div>
      </div>

      {/* Performance Comparison */}
      <div style={{ 
        marginTop: '20px', 
        padding: '20px', 
        backgroundColor: '#fff3cd', 
        borderRadius: '5px',
        border: '1px solid #ffeaa7'
      }}>
        <h4 style={{ margin: '0 0 15px 0', color: '#856404' }}>⚡ Performance & Use Cases</h4>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '15px',
          color: '#856404'
        }}>
          <div>
            <h5 style={{ margin: '0 0 8px 0' }}>Singly Linked</h5>
            <ul style={{ margin: '0', paddingLeft: '15px', fontSize: '13px' }}>
              <li>Minimal memory overhead</li>
              <li>Simple implementation</li>
              <li>Good for stacks, queues</li>
            </ul>
          </div>
          <div>
            <h5 style={{ margin: '0 0 8px 0' }}>Doubly Linked</h5>
            <ul style={{ margin: '0', paddingLeft: '15px', fontSize: '13px' }}>
              <li>Bidirectional traversal</li>
              <li>O(1) tail operations</li>
              <li>Good for deques, LRU cache</li>
            </ul>
          </div>
          <div>
            <h5 style={{ margin: '0 0 8px 0' }}>Circular</h5>
            <ul style={{ margin: '0', paddingLeft: '15px', fontSize: '13px' }}>
              <li>Continuous traversal</li>
              <li>Round-robin scheduling</li>
              <li>Josephus problem</li>
            </ul>
          </div>
          <div>
            <h5 style={{ margin: '0 0 8px 0' }}>Doubly Circular</h5>
            <ul style={{ margin: '0', paddingLeft: '15px', fontSize: '13px' }}>
              <li>Best of both worlds</li>
              <li>Complex but powerful</li>
              <li>Advanced data structures</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualizer;
