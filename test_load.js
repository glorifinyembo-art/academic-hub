// Test load of app.js with basic mocks in ESM
import { readFileSync } from 'node:fs';

global.window = {
  location: {
    search: '',
    pathname: '/'
  },
  scrollTo: () => {},
  addEventListener: () => {},
  lucide: {
    createIcons: () => {}
  }
};
global.document = {
  getElementById: (id) => {
    return {
      classList: {
        add: () => {},
        remove: () => {},
        contains: () => false
      },
      style: {},
      addEventListener: () => {}
    };
  },
  addEventListener: () => {}
};
global.sessionStorage = {
  getItem: () => '',
  setItem: () => ''
};
global.FileReader = class {};
global.fetch = () => Promise.resolve({ json: () => Promise.resolve({ success: true, data: [] }) });

try {
  const code = readFileSync('./app.js', 'utf8');
  // Evaluate the code in global context
  Function('window', 'document', 'sessionStorage', 'FileReader', 'fetch', code)(
    global.window, global.document, global.sessionStorage, global.FileReader, global.fetch
  );
  console.log('SUCCESS: app.js loaded and window.app was instantiated successfully!');
  if (typeof global.window.app.openCameraModal === 'function') {
    console.log('SUCCESS: openCameraModal is a function!');
  } else {
    console.log('FAIL: openCameraModal is NOT a function!');
  }
  if (typeof global.window.app.openLibraryModal === 'function') {
    console.log('SUCCESS: openLibraryModal is a function!');
  } else {
    console.log('FAIL: openLibraryModal is NOT a function!');
  }
} catch (err) {
  console.error('ERROR during app.js load:', err);
}
