# Layout Component

The `Layout` component provides a consistent layout structure for all screens in the ShopFlow app.

## Features

- ✅ **SafeAreaView** - Handles system status bar properly
- ✅ **Top Bar** - PGW logo and menu icon (can be hidden or customized)
- ✅ **Menu Bar** - Slide-out menu with logout functionality
- ✅ **Consistent Styling** - Common styles across all screens

## Usage

### Basic Usage
```jsx
import Layout from '../components/Layout';

const MyScreen = ({ navigation }) => {
  return (
    <Layout navigation={navigation}>
      {/* Your screen content here */}
    </Layout>
  );
};
```

### Hide Top Bar
```jsx
<Layout navigation={navigation} showTopBar={false}>
  {/* Content without top bar */}
</Layout>
```

### Custom Menu Handler
```jsx
<Layout 
  navigation={navigation}
  onMenuPress={() => {
    // Your custom menu logic
    // This will override the default menu
  }}
>
  {/* Content */}
</Layout>
```

### Custom Top Bar
```jsx
<Layout 
  navigation={navigation}
  customTopBar={
    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text>Custom Title</Text>
      <Button>Custom Button</Button>
    </View>
  }
>
  {/* Content */}
</Layout>
```

## Menu Features

The Layout component includes a slide-out menu with:
- **Logout functionality** - Returns user to login screen
- **Confirmation dialog** - Asks user to confirm logout
- **Smooth animations** - Slide-in/out transitions
- **Touch outside to close** - Tap outside menu to dismiss

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `children` | ReactNode | - | Screen content |
| `showTopBar` | boolean | true | Show/hide the top bar |
| `onMenuPress` | function | Opens menu | Custom menu press handler |
| `customTopBar` | ReactNode | - | Custom top bar component |
| `navigation` | object | - | Navigation object (required for logout) |

## Benefits

1. **Consistency** - All screens have the same layout structure
2. **DRY Principle** - No need to repeat SafeAreaView and top bar code
3. **Maintainability** - Changes to layout structure only need to be made in one place
4. **Flexibility** - Can be customized for different screen needs
5. **Built-in Menu** - Ready-to-use menu with logout functionality 