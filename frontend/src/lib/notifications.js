/**
 * Real-time notification utilities using react-hot-toast.
 * Provides consistent notification styles and behavior across the application.
 */
import toast from 'react-hot-toast';

/**
 * Default toast configuration
 */
const defaultToastConfig = {
  duration: 4000,
  position: 'top-right',
  style: {
    background: '#1a1a1a',
    color: '#e0e0e0',
    border: '1px solid #333',
    borderRadius: '8px',
    padding: '12px 16px',
  },
};

/**
 * Notification utilities
 */
export const notify = {
  /**
   * Success notification
   * @param {string} message - Message to display
   * @param {object} options - Additional toast options
   */
  success: (message, options = {}) => {
    return toast.success(message, {
      ...defaultToastConfig,
      icon: '✅',
      style: {
        ...defaultToastConfig.style,
        borderLeft: '4px solid #10b981',
      },
      ...options,
    });
  },

  /**
   * Error notification
   * @param {string} message - Message to display
   * @param {object} options - Additional toast options
   */
  error: (message, options = {}) => {
    return toast.error(message, {
      ...defaultToastConfig,
      icon: '❌',
      duration: 5000,
      style: {
        ...defaultToastConfig.style,
        borderLeft: '4px solid #ef4444',
      },
      ...options,
    });
  },

  /**
   * Warning notification
   * @param {string} message - Message to display
   * @param {object} options - Additional toast options
   */
  warning: (message, options = {}) => {
    return toast(message, {
      ...defaultToastConfig,
      icon: '⚠️',
      duration: 5000,
      style: {
        ...defaultToastConfig.style,
        borderLeft: '4px solid #f59e0b',
      },
      ...options,
    });
  },

  /**
   * Info notification
   * @param {string} message - Message to display
   * @param {object} options - Additional toast options
   */
  info: (message, options = {}) => {
    return toast(message, {
      ...defaultToastConfig,
      icon: 'ℹ️',
      style: {
        ...defaultToastConfig.style,
        borderLeft: '4px solid #3b82f6',
      },
      ...options,
    });
  },

  /**
   * Loading notification
   * @param {string} message - Message to display
   * @param {object} options - Additional toast options
   */
  loading: (message, options = {}) => {
    return toast.loading(message, {
      ...defaultToastConfig,
      style: {
        ...defaultToastConfig.style,
        borderLeft: '4px solid #6b7280',
      },
      ...options,
    });
  },

  /**
   * Custom notification
   * @param {string} message - Message to display
   * @param {object} options - Additional toast options
   */
  custom: (message, options = {}) => {
    return toast(message, {
      ...defaultToastConfig,
      ...options,
    });
  },

  /**
   * Dismiss a specific toast
   * @param {string} toastId - Toast ID to dismiss
   */
  dismiss: (toastId) => {
    toast.dismiss(toastId);
  },

  /**
   * Dismiss all toasts
   */
  dismissAll: () => {
    toast.dismiss();
  },

  /**
   * Promise-based notification
   * Shows loading, then success/error based on promise result
   * @param {Promise} promise - Promise to track
   * @param {object} messages - Messages for loading, success, and error states
   */
  promise: (promise, messages) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading || 'Loading...',
        success: messages.success || 'Success!',
        error: messages.error || 'Error occurred',
      },
      defaultToastConfig
    );
  },
};

/**
 * Predefined notification messages for common events
 */
export const notificationMessages = {
  // Vehicle notifications
  lowFuel: (vehicleName, level) => 
    `⛽ ${vehicleName} har låg bränslenivå (${level}%)`,
  
  maintenanceDue: (vehicleName, days) => 
    `🔧 ${vehicleName} behöver underhåll om ${days} dagar`,
  
  maintenanceOverdue: (vehicleName) => 
    `⚠️ ${vehicleName} är försenat för underhåll`,
  
  vehicleAssigned: (vehicleName, route) => 
    `✅ ${vehicleName} tilldelad till ${route}`,
  
  refuelCompleted: (vehicleName, amount) => 
    `⛽ ${vehicleName} tankad med ${amount} liter`,
  
  // Delivery notifications
  deliveryCompleted: (trackingNumber) => 
    `📦 Leverans ${trackingNumber} slutförd`,
  
  deliveryCreated: (trackingNumber) => 
    `📋 Ny leverans skapad: ${trackingNumber}`,
  
  deliveryDelayed: (trackingNumber) => 
    `⏱️ Leverans ${trackingNumber} försenad`,
  
  // Driver notifications
  driverCheckIn: (driverName) => 
    `👤 ${driverName} har checkat in`,
  
  driverCheckOut: (driverName) => 
    `👋 ${driverName} har checkat ut`,
  
  // Inventory notifications
  lowStock: (itemName, quantity) => 
    `📦 Lågt lager: ${itemName} (${quantity} kvar)`,
  
  stockReplenished: (itemName, quantity) => 
    `✅ Lager påfyllt: ${itemName} (+${quantity})`,
  
  // System notifications
  dataExported: (filename) => 
    `💾 Data exporterad till ${filename}`,
  
  reportGenerated: (reportType) => 
    `📊 ${reportType} rapport genererad`,
  
  settingsSaved: () => 
    `⚙️ Inställningar sparade`,
  
  // Error notifications
  apiError: () => 
    `❌ API-fel: Kunde inte hämta data`,
  
  validationError: (field) => 
    `⚠️ Valideringsfel: ${field}`,
  
  permissionDenied: () => 
    `🚫 Åtkomst nekad: Otillräckliga behörigheter`,
};

export default notify;
