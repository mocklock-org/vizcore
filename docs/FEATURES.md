# VizCore Features

## Core Package (`@vizcore/core`)

### Main VizCore Class
- **Plugin Management**: Register and manage plugins with lifecycle control (initialize/destroy)
- **Data Processing**: Process data through registered processors with validation and error handling
- **Memory Management**: Track memory allocation, usage statistics, and warning thresholds
- **Performance Monitoring**: Measure processing time, memory usage, and collect metrics with sampling
- **Configuration**: Flexible configuration system with defaults and user overrides

### Memory Manager
- **Memory Allocation**: Track and limit memory usage with configurable thresholds
- **Usage Statistics**: Monitor memory consumption and available capacity
- **Warning System**: Alert when memory usage exceeds warning thresholds
- **Object Size Estimation**: Calculate memory footprint of JavaScript objects

### Performance Monitor
- **Processing Time Tracking**: Measure execution time of data processing operations
- **Memory Usage Metrics**: Track memory consumption during operations
- **Sampling Control**: Configure monitoring sampling rates for performance optimization
- **Metrics Aggregation**: Calculate average processing times and memory usage

### Plugin Registry
- **Plugin Lifecycle**: Initialize, register, and destroy plugins safely
- **Data Processor Registry**: Manage data processing functions with validation
- **Plugin Discovery**: Retrieve registered plugins and processors by name
- **Cleanup Management**: Properly destroy all plugins and processors on shutdown

### HTTP Server
- **Health Endpoint**: `/health` - System health status with memory and performance metrics
- **Readiness Endpoint**: `/ready` - Component readiness status
- **API Endpoint**: Basic API information and status
- **Error Handling**: Centralized error handling with development/production modes

## React Package (`@vizcore/react`)

### VizCore Context Provider
- **Core Instance Management**: Initialize and manage VizCore instance lifecycle
- **Configuration Support**: Pass configuration options to core instance
- **Error Handling**: Capture and expose initialization errors
- **Ready State**: Track when VizCore is ready for use

### useVizCore Hook
- **Core Access**: Direct access to VizCore instance and methods
- **Data Processing**: Process data through registered processors
- **Memory Stats**: Retrieve current memory usage statistics
- **Performance Metrics**: Access performance monitoring data

### useSystemMetrics Hook
- **Real-time Metrics**: Monitor memory and performance metrics in real-time
- **Auto-refresh**: Configurable automatic metric updates with intervals
- **Manual Refresh**: On-demand metric refresh functionality
- **Loading States**: Track loading and error states during metric collection

### useDataUpload Hook
- **File Upload**: Handle File object uploads with progress tracking
- **Data Processing**: Process uploaded data through specified processors
- **Progress Tracking**: Monitor upload and processing progress (0-100%)
- **Error Handling**: Capture and expose upload/processing errors
- **Success Callbacks**: Execute callbacks on successful data processing

---

*All features are implemented with TypeScript for type safety and include comprehensive error handling.*
