// Chrome extension API type definitions
declare namespace chrome {
  namespace runtime {
    function sendMessage(
      message: any,
      responseCallback?: (response: any) => void
    ): void;
    
    const onMessage: {
      addListener(
        callback: (
          message: any,
          sender: any,
          sendResponse: (response?: any) => void
        ) => void | boolean
      ): void;
    };
    
    const onInstalled: {
      addListener(callback: () => void): void;
    };
  }
  
  namespace action {
    const onClicked: {
      addListener(callback: (tab: { id?: number }) => void): void;
    };
  }
  
  namespace sidePanel {
    function setPanelBehavior(options: { openPanelOnActionClick: boolean }): void;
    function open(options?: { tabId?: number }): void;
  }
  
  namespace storage {
    interface StorageArea {
      get(
        keys: string | string[] | Record<string, any> | null,
        callback: (items: Record<string, any>) => void
      ): void;
      
      set(
        items: Record<string, any>,
        callback?: () => void
      ): void;
    }
    
    const sync: StorageArea;
    const local: StorageArea;
  }
}