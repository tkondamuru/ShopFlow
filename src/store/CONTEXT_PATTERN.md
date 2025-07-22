# Context Pattern Documentation

## Overview
This document explains the pattern used for customer-dependent contexts in the ShopFlow app.

## Context Pattern

### 1. Context Structure
Each customer-dependent context should follow this pattern:

```javascript
// Example: VINContext.js
export const VINProvider = ({ children }) => {
  const [currentState, setCurrentState] = useState('');
  const [lastState, setLastState] = useState(''); // Remember last state for restoration

  // Custom setter that remembers non-empty values
  const updateCurrentState = (value) => {
    if (value && value !== '') {
      setLastState(value); // Remember non-empty values
    }
    setCurrentState(value);
  };

  // Clear context but preserve last state (for normal operations)
  const clearContext = () => {
    setCurrentState('');
    // Note: We don't clear lastState here
  };

  // Clear everything including last state (for shop changes)
  const clearAllContext = () => {
    setCurrentState('');
    setLastState('');
  };

  return (
    <VINContext.Provider value={{
      currentState,
      setCurrentState: updateCurrentState, // Use custom setter
      lastState,
      setLastState,
      clearContext,
      clearAllContext,
    }}>
      {children}
    </VINContext.Provider>
  );
};
```

### 2. Global Access Setup
In screens that use the context, set up global access:

```javascript
// In VINScreen.js
const { clearAllVINContext } = useVINContext();

useEffect(() => {
  global.clearAllVINContext = clearAllVINContext;
  return () => {
    delete global.clearAllVINContext;
  };
}, [clearAllVINContext]);
```

### 3. Shop Selection Integration
The `selectShopAndNavigateHome` function in CustomerContext automatically clears all contexts:

```javascript
const selectShopAndNavigateHome = async (shop, navigation) => {
  // Clear all customer-dependent contexts
  if (global.clearAllOrderContext) {
    global.clearAllOrderContext();
  }
  if (global.clearAllVINContext) {
    global.clearAllVINContext();
  }
  if (global.clearAllMMYContext) {
    global.clearAllMMYContext();
  }
  // Add more as needed...
  
  await updateSelectedShop(shop);
  if (navigation) {
    navigation.navigate('Home');
  }
};
```

## Adding New Contexts

### Step 1: Create Context File
Create a new context file following the pattern above (e.g., `SearchContext.js`).

### Step 2: Add to App.js
Wrap your app with the new context provider:

```javascript
// In App.js
import { SearchProvider } from './src/store/SearchContext';

export default function App() {
  return (
    <CustomerProvider>
      <OrderProvider>
        <VINProvider>
          <MMYProvider>
            <SearchProvider> {/* Add your new context here */}
              {/* Your app components */}
            </SearchProvider>
          </MMYProvider>
        </VINProvider>
      </OrderProvider>
    </CustomerProvider>
  );
}
```

### Step 3: Set Up Global Access
In screens that use the context:

```javascript
// In SearchScreen.js
const { clearAllSearchContext } = useSearchContext();

useEffect(() => {
  global.clearAllSearchContext = clearAllSearchContext;
  return () => {
    delete global.clearAllSearchContext;
  };
}, [clearAllSearchContext]);
```

### Step 4: Add to CustomerContext
Add the global clearing to `selectShopAndNavigateHome`:

```javascript
// In CustomerContext.js
if (global.clearAllSearchContext) {
  global.clearAllSearchContext();
}
```

## Benefits

1. **Consistent Behavior**: All contexts follow the same pattern
2. **Automatic Cleanup**: Shop changes clear all customer-dependent state
3. **State Restoration**: Users return to their previous context when re-entering screens
4. **Scalable**: Easy to add new contexts following the same pattern
5. **Maintainable**: Clear separation of concerns

## Context Types

### Customer-Dependent Contexts (Clear on Shop Change)
- OrderContext
- VINContext  
- MMYContext
- SearchContext
- CartContext

### Customer-Independent Contexts (Don't Clear on Shop Change)
- UIStateContext
- ThemeContext
- NavigationContext

Only customer-dependent contexts should be cleared when shops change. 